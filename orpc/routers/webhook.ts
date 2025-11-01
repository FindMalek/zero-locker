import { SubscriptionEntity } from "@/entities/subscription"
import { webhookSignatureMiddleware } from "@/middleware/webhook"
import {
  Currency,
  database,
  InvoiceStatus,
  PaymentTransactionStatus,
  SubscriptionChangeSource,
  SubscriptionInterval,
  UserPlan,
} from "@/prisma/client"
import { subscriptionStatusEnum } from "@/schemas/subscription/subscription/enums"
import {
  lemonSqueezyEventTypeEnum,
  lemonSqueezyWebhookPayloadSchema,
  webhookInputSchema,
  webhookOutputSchema,
  type LemonSqueezyEventType,
  type LemonSqueezySubscriptionAttributes,
  type WebhookOutput,
} from "@/schemas/subscription/webhook"
import { ORPCError, os } from "@orpc/server"
import { z } from "zod"

import type { ORPCContext } from "../types"

const baseProcedure = os.$context<ORPCContext>()

// Public webhook procedure with signature verification middleware
const webhookProcedure = baseProcedure.use(webhookSignatureMiddleware)

type SubscriptionData = z.infer<typeof lemonSqueezyWebhookPayloadSchema>["data"]

/**
 * Process subscription events from Lemon Squeezy webhooks
 *
 * @param eventType - The type of subscription event
 * @param subscriptionData - The subscription data from the webhook
 * @param customData - Custom data from webhook meta (contains userId)
 * @returns Promise with success status and message
 *
 * @description
 * Handles various subscription lifecycle events:
 * - subscription_created: Creates subscription, updates user plan to PRO, sends welcome email
 * - subscription_updated: Updates subscription status and metadata
 * - subscription_cancelled: Updates subscription, downgrades user plan after period ends, sends cancellation email
 * - subscription_resumed: Updates subscription, upgrades user plan back to PRO, sends reactivation email
 * - subscription_expired: Updates subscription, downgrades user plan to NORMAL, sends expiration email
 * - subscription_paused: Updates subscription status
 * - subscription_unpaused: Updates subscription status, upgrades user plan back to PRO
 * - subscription_payment_success: Updates payment metadata, extends renewsAt date
 * - subscription_payment_failed: Updates webhook metadata, sends payment failure email
 * - subscription_payment_recovered: Updates webhook metadata, sends payment recovered email
 */
async function processSubscriptionEvent(
  eventType: LemonSqueezyEventType,
  subscriptionData: SubscriptionData,
  customData?: { userId?: string }
): Promise<{ success: boolean; message: string }> {
  const subscriptionId = subscriptionData.id
  const attributes: LemonSqueezySubscriptionAttributes =
    subscriptionData.attributes

  try {
    switch (eventType) {
      /**
       * Handles subscription creation event
       *
       * Actions performed:
       * 1. Finds user by email or custom_data.userId
       * 2. Finds or creates payment product
       * 3. Creates subscription record
       * 4. Creates subscription history entry
       * 5. Updates user plan to PRO (if applicable)
       *
       * Deferred: Send welcome email to user (see LINEAR_ISSUE_WEBHOOK_IMPROVEMENTS.md)
       */
      case lemonSqueezyEventTypeEnum.subscription_created: {
        // Find the user by email or custom_data.userId
        const user = await database.user.findFirst({
          where: {
            OR: [
              ...(attributes.user_email
                ? [{ email: attributes.user_email }]
                : []),
              ...(customData?.userId ? [{ id: customData.userId }] : []),
            ],
          },
        })

        if (!user) {
          return {
            success: false,
            message: `User not found for subscription ${subscriptionId}`,
          }
        }

        // Find or create the product
        let product = await database.paymentProduct.findUnique({
          where: { variantId: attributes.variant_id },
        })

        // Convert price from cents to dollars (Lemon Squeezy sends price in cents)
        const priceInDollars = attributes.price / 100

        if (!product) {
          // Create product if it doesn't exist
          product = await database.paymentProduct.create({
            data: {
              productId: attributes.product_id,
              variantId: attributes.variant_id,
              name: attributes.product_name || "Unknown Product",
              description: attributes.product_description,
              price: priceInDollars,
              currency:
                (attributes.currency?.toUpperCase() as Currency) ||
                Currency.USD,
              interval:
                (attributes.renewal_interval?.toUpperCase() as SubscriptionInterval) ||
                SubscriptionInterval.MONTHLY,
            },
          })
        }

        // Create subscription
        const createdSubscription = await database.paymentSubscription.create({
          data: {
            subscriptionId,
            orderId: attributes.order_id,
            customerId: attributes.customer_id,
            status: SubscriptionEntity.convertLemonSqueezyStatusToInternal(
              attributes.status
            ),
            productId: product.id,
            price: priceInDollars,
            currency:
              (attributes.currency?.toUpperCase() as Currency) || Currency.USD,
            renewsAt: attributes.renews_at
              ? new Date(attributes.renews_at)
              : null,
            endsAt: attributes.ends_at ? new Date(attributes.ends_at) : null,
            trialEndsAt: attributes.trial_ends_at
              ? new Date(attributes.trial_ends_at)
              : null,
            userId: user.id,
            lastWebhookAt: new Date(),
            webhookCount: 1,
          },
        })

        // Create subscription history entry for initial creation
        const newStatus =
          SubscriptionEntity.convertLemonSqueezyStatusToInternal(
            attributes.status
          )
        await database.paymentSubscriptionHistory.create({
          data: {
            subscriptionId: createdSubscription.id,
            newStatus,
            newPrice: priceInDollars,
            reason: "Initial subscription creation",
            changedBy: SubscriptionChangeSource.WEBHOOK,
            metadata: {
              eventType: "subscription_created",
              webhookSubscriptionId: subscriptionId,
            },
          },
        })

        // Update user plan to PRO when subscription is created
        if (newStatus === subscriptionStatusEnum.ACTIVE) {
          await database.user.update({
            where: { id: user.id },
            data: { plan: UserPlan.PRO },
          })
        }

        return {
          success: true,
          message: `Subscription ${subscriptionId} created successfully`,
        }
      }

      /**
       * Handles subscription update event
       *
       * Actions performed:
       * 1. Updates subscription status and metadata
       * 2. Creates subscription history entry if status/price changed
       *
       * Deferred: Update user plan based on status changes, send update notification email (see LINEAR_ISSUE_WEBHOOK_IMPROVEMENTS.md)
       */
      case lemonSqueezyEventTypeEnum.subscription_updated: {
        const subscription = await database.paymentSubscription.findUnique({
          where: { subscriptionId },
          include: { user: true },
        })

        if (!subscription) {
          return {
            success: false,
            message: `Subscription ${subscriptionId} not found`,
          }
        }

        const previousStatus = subscription.status
        const previousPrice = subscription.price
        const newStatus =
          SubscriptionEntity.convertLemonSqueezyStatusToInternal(
            attributes.status
          )

        // Update subscription status and metadata
        const updatedSubscription = await database.paymentSubscription.update({
          where: { subscriptionId },
          data: {
            status: newStatus,
            renewsAt: attributes.renews_at
              ? new Date(attributes.renews_at)
              : null,
            endsAt: attributes.ends_at ? new Date(attributes.ends_at) : null,
            trialEndsAt: attributes.trial_ends_at
              ? new Date(attributes.trial_ends_at)
              : null,
            lastWebhookAt: new Date(),
            webhookCount: { increment: 1 },
          },
        })

        // Create subscription history entry for status/price change
        if (
          previousStatus !== newStatus ||
          Number(previousPrice) !== Number(updatedSubscription.price)
        ) {
          await database.paymentSubscriptionHistory.create({
            data: {
              subscriptionId: updatedSubscription.id,
              previousStatus,
              newStatus,
              previousPrice: Number(previousPrice),
              newPrice: Number(updatedSubscription.price),
              reason: "Subscription updated via webhook",
              changedBy: SubscriptionChangeSource.WEBHOOK,
              metadata: {
                eventType: "subscription_updated",
              },
            },
          })
        }

        return {
          success: true,
          message: `Subscription ${subscriptionId} updated successfully`,
        }
      }

      /**
       * Handles subscription cancellation event
       *
       * Actions performed:
       * 1. Updates subscription status to CANCELLED
       * 2. Sets cancelledReason and cancelledAt fields
       * 3. Sets endsAt date (subscription remains active until period ends)
       * 4. Creates subscription history entry
       * 5. Keeps user plan as PRO until subscription period ends
       *
       * Note: User plan should be downgraded when subscription actually ends (on expires_at date)
       * Deferred: Send cancellation confirmation email (see LINEAR_ISSUE_WEBHOOK_IMPROVEMENTS.md)
       */
      case lemonSqueezyEventTypeEnum.subscription_cancelled: {
        const subscription = await database.paymentSubscription.findUnique({
          where: { subscriptionId },
          include: { user: true },
        })

        if (!subscription) {
          return {
            success: false,
            message: `Subscription ${subscriptionId} not found`,
          }
        }

        const previousStatus = subscription.status
        const cancelledStatus =
          SubscriptionEntity.convertLemonSqueezyStatusToInternal(
            attributes.status
          )

        // Update subscription status and metadata
        const updatedSubscription = await database.paymentSubscription.update({
          where: { subscriptionId },
          data: {
            status: cancelledStatus,
            renewsAt: attributes.renews_at
              ? new Date(attributes.renews_at)
              : null,
            endsAt: attributes.ends_at ? new Date(attributes.ends_at) : null,
            trialEndsAt: attributes.trial_ends_at
              ? new Date(attributes.trial_ends_at)
              : null,
            cancelledReason: "User cancelled subscription",
            cancelledAt: new Date(),
            lastWebhookAt: new Date(),
            webhookCount: { increment: 1 },
          },
        })

        // Create subscription history entry for cancellation
        await database.paymentSubscriptionHistory.create({
          data: {
            subscriptionId: updatedSubscription.id,
            previousStatus,
            newStatus: cancelledStatus,
            reason: "Subscription cancelled by user",
            changedBy: SubscriptionChangeSource.WEBHOOK,
            metadata: {
              eventType: "subscription_cancelled",
              endsAt: attributes.ends_at,
            },
          },
        })

        return {
          success: true,
          message: `Subscription ${subscriptionId} cancelled successfully`,
        }
      }

      /**
       * Handles subscription resume event
       *
       * Actions performed:
       * 1. Updates subscription status back to ACTIVE
       * 2. Clears cancelledReason and cancelledAt fields
       * 3. Creates subscription history entry
       * 4. Updates user plan to PRO
       *
       * Deferred: Send reactivation welcome email (see LINEAR_ISSUE_WEBHOOK_IMPROVEMENTS.md)
       */
      case lemonSqueezyEventTypeEnum.subscription_resumed: {
        const subscription = await database.paymentSubscription.findUnique({
          where: { subscriptionId },
          include: { user: true },
        })

        if (!subscription) {
          return {
            success: false,
            message: `Subscription ${subscriptionId} not found`,
          }
        }

        const previousStatus = subscription.status
        const newStatus =
          SubscriptionEntity.convertLemonSqueezyStatusToInternal(
            attributes.status
          )

        // Update subscription status and metadata
        const updatedSubscription = await database.paymentSubscription.update({
          where: { subscriptionId },
          data: {
            status: newStatus,
            renewsAt: attributes.renews_at
              ? new Date(attributes.renews_at)
              : null,
            endsAt: attributes.ends_at ? new Date(attributes.ends_at) : null,
            trialEndsAt: attributes.trial_ends_at
              ? new Date(attributes.trial_ends_at)
              : null,
            cancelledReason: null,
            cancelledAt: null,
            lastWebhookAt: new Date(),
            webhookCount: { increment: 1 },
          },
        })

        // Create subscription history entry for resume
        await database.paymentSubscriptionHistory.create({
          data: {
            subscriptionId: updatedSubscription.id,
            previousStatus,
            newStatus,
            reason: "Subscription resumed by user",
            changedBy: SubscriptionChangeSource.WEBHOOK,
            metadata: {
              eventType: "subscription_resumed",
            },
          },
        })

        // Update user plan back to PRO when subscription is resumed
        if (newStatus === subscriptionStatusEnum.ACTIVE) {
          await database.user.update({
            where: { id: subscription.userId },
            data: { plan: UserPlan.PRO },
          })
        }

        return {
          success: true,
          message: `Subscription ${subscriptionId} resumed successfully`,
        }
      }

      /**
       * Handles subscription expiration event
       *
       * Actions performed:
       * 1. Updates subscription status to EXPIRED
       * 2. Creates subscription history entry
       * 3. Downgrades user plan from PRO to NORMAL
       *
       * Deferred: Send expiration notification email (see LINEAR_ISSUE_WEBHOOK_IMPROVEMENTS.md)
       */
      case lemonSqueezyEventTypeEnum.subscription_expired: {
        const subscription = await database.paymentSubscription.findUnique({
          where: { subscriptionId },
          include: { user: true },
        })

        if (!subscription) {
          return {
            success: false,
            message: `Subscription ${subscriptionId} not found`,
          }
        }

        const previousStatus = subscription.status
        const expiredStatus =
          SubscriptionEntity.convertLemonSqueezyStatusToInternal(
            attributes.status
          )

        // Update subscription status and metadata
        const updatedSubscription = await database.paymentSubscription.update({
          where: { subscriptionId },
          data: {
            status: expiredStatus,
            renewsAt: attributes.renews_at
              ? new Date(attributes.renews_at)
              : null,
            endsAt: attributes.ends_at ? new Date(attributes.ends_at) : null,
            trialEndsAt: attributes.trial_ends_at
              ? new Date(attributes.trial_ends_at)
              : null,
            lastWebhookAt: new Date(),
            webhookCount: { increment: 1 },
          },
        })

        // Create subscription history entry for expiration
        await database.paymentSubscriptionHistory.create({
          data: {
            subscriptionId: updatedSubscription.id,
            previousStatus,
            newStatus: expiredStatus,
            reason: "Subscription expired",
            changedBy: SubscriptionChangeSource.WEBHOOK,
            metadata: {
              eventType: "subscription_expired",
            },
          },
        })

        // Downgrade user plan to NORMAL when subscription expires
        await database.user.update({
          where: { id: subscription.userId },
          data: { plan: UserPlan.NORMAL },
        })

        return {
          success: true,
          message: `Subscription ${subscriptionId} expired and user plan downgraded`,
        }
      }

      /**
       * Handles subscription pause event
       *
       * Actions performed:
       * 1. Updates subscription status to PAUSED
       * 2. Creates subscription history entry
       *
       * Deferred: Pause user plan benefits logic, send pause notification email (see LINEAR_ISSUE_WEBHOOK_IMPROVEMENTS.md)
       */
      case lemonSqueezyEventTypeEnum.subscription_paused: {
        const subscription = await database.paymentSubscription.findUnique({
          where: { subscriptionId },
          include: { user: true },
        })

        if (!subscription) {
          return {
            success: false,
            message: `Subscription ${subscriptionId} not found`,
          }
        }

        const previousStatus = subscription.status
        const pausedStatus =
          SubscriptionEntity.convertLemonSqueezyStatusToInternal(
            attributes.status
          )

        // Update subscription status and metadata
        const updatedSubscription = await database.paymentSubscription.update({
          where: { subscriptionId },
          data: {
            status: pausedStatus,
            renewsAt: attributes.renews_at
              ? new Date(attributes.renews_at)
              : null,
            endsAt: attributes.ends_at ? new Date(attributes.ends_at) : null,
            trialEndsAt: attributes.trial_ends_at
              ? new Date(attributes.trial_ends_at)
              : null,
            lastWebhookAt: new Date(),
            webhookCount: { increment: 1 },
          },
        })

        // Create subscription history entry for pause
        await database.paymentSubscriptionHistory.create({
          data: {
            subscriptionId: updatedSubscription.id,
            previousStatus,
            newStatus: pausedStatus,
            reason: "Subscription paused",
            changedBy: SubscriptionChangeSource.WEBHOOK,
            metadata: {
              eventType: "subscription_paused",
            },
          },
        })

        return {
          success: true,
          message: `Subscription ${subscriptionId} paused successfully`,
        }
      }

      /**
       * Handles subscription unpause event
       *
       * Actions performed:
       * 1. Updates subscription status back to ACTIVE
       * 2. Creates subscription history entry
       * 3. Restores user plan benefits to PRO
       *
       * Deferred: Send unpause notification email (see LINEAR_ISSUE_WEBHOOK_IMPROVEMENTS.md)
       */
      case lemonSqueezyEventTypeEnum.subscription_unpaused: {
        const subscription = await database.paymentSubscription.findUnique({
          where: { subscriptionId },
          include: { user: true },
        })

        if (!subscription) {
          return {
            success: false,
            message: `Subscription ${subscriptionId} not found`,
          }
        }

        const previousStatus = subscription.status
        const newStatus =
          SubscriptionEntity.convertLemonSqueezyStatusToInternal(
            attributes.status
          )

        // Update subscription status and metadata
        const updatedSubscription = await database.paymentSubscription.update({
          where: { subscriptionId },
          data: {
            status: newStatus,
            renewsAt: attributes.renews_at
              ? new Date(attributes.renews_at)
              : null,
            endsAt: attributes.ends_at ? new Date(attributes.ends_at) : null,
            trialEndsAt: attributes.trial_ends_at
              ? new Date(attributes.trial_ends_at)
              : null,
            lastWebhookAt: new Date(),
            webhookCount: { increment: 1 },
          },
        })

        // Create subscription history entry for unpause
        await database.paymentSubscriptionHistory.create({
          data: {
            subscriptionId: updatedSubscription.id,
            previousStatus,
            newStatus,
            reason: "Subscription unpaused",
            changedBy: SubscriptionChangeSource.WEBHOOK,
            metadata: {
              eventType: "subscription_unpaused",
            },
          },
        })

        // Restore user plan to PRO when subscription is unpaused
        if (newStatus === subscriptionStatusEnum.ACTIVE) {
          await database.user.update({
            where: { id: subscription.userId },
            data: { plan: UserPlan.PRO },
          })
        }

        return {
          success: true,
          message: `Subscription ${subscriptionId} unpaused successfully`,
        }
      }

      /**
       * Handles successful subscription payment event
       *
       * Actions performed:
       * 1. Creates payment transaction record
       * 2. Creates invoice for the transaction
       * 3. Updates renewsAt date with next billing date
       * 4. Updates webhook metadata
       * 5. Ensures user plan remains PRO
       *
       * Deferred: Send payment receipt email (see LINEAR_ISSUE_WEBHOOK_IMPROVEMENTS.md)
       */
      case lemonSqueezyEventTypeEnum.subscription_payment_success: {
        const subscription = await database.paymentSubscription.findUnique({
          where: { subscriptionId },
          include: { user: true },
        })

        if (!subscription) {
          return {
            success: false,
            message: `Subscription ${subscriptionId} not found`,
          }
        }

        // Calculate billing period dates
        const now = new Date()
        const billingPeriodStart = subscription.renewsAt
          ? new Date(subscription.renewsAt)
          : new Date(now.getFullYear(), now.getMonth(), 1)
        const billingPeriodEnd = attributes.renews_at
          ? new Date(attributes.renews_at)
          : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

        // Create payment transaction for successful payment
        const transaction = await database.paymentTransaction.create({
          data: {
            transactionId: `txn-${subscriptionId}-${now.getTime()}`,
            subscriptionId: subscription.id,
            amount: subscription.price,
            currency: subscription.currency,
            status: PaymentTransactionStatus.SUCCESS,
            description: "Monthly subscription payment",
            paymentDate: now,
            billingPeriodStart,
            billingPeriodEnd,
          },
        })

        // Create invoice for the transaction
        const invoiceNumber = `INV-${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}-${String(transaction.id.slice(-6)).toUpperCase()}`
        await database.invoice.create({
          data: {
            invoiceNumber,
            subscriptionId: subscription.id,
            transactionId: transaction.id,
            amount: subscription.price,
            currency: subscription.currency,
            status: InvoiceStatus.PAID,
            dueDate: billingPeriodStart,
            paidAt: now,
            billingPeriodStart,
            billingPeriodEnd,
            notes: "Monthly subscription invoice",
          },
        })

        // Update webhook metadata and renewsAt date
        await database.paymentSubscription.update({
          where: { subscriptionId },
          data: {
            renewsAt: attributes.renews_at
              ? new Date(attributes.renews_at)
              : null,
            lastWebhookAt: new Date(),
            webhookCount: { increment: 1 },
          },
        })

        // Ensure user plan is PRO when payment is successful
        if (subscription.user.plan !== UserPlan.PRO) {
          await database.user.update({
            where: { id: subscription.userId },
            data: { plan: UserPlan.PRO },
          })
        }

        return {
          success: true,
          message: `Payment success event processed for subscription ${subscriptionId}`,
        }
      }

      /**
       * Handles failed subscription payment event
       *
       * Actions performed:
       * 1. Creates payment transaction record (FAILED status)
       * 2. Updates subscription status to PAST_DUE or UNPAID
       * 3. Creates subscription history entry if status changed
       * 4. Updates webhook metadata
       *
       * Deferred: Send payment failure notification email, implement automatic downgrade after multiple failures (see LINEAR_ISSUE_WEBHOOK_IMPROVEMENTS.md)
       */
      case lemonSqueezyEventTypeEnum.subscription_payment_failed: {
        const subscription = await database.paymentSubscription.findUnique({
          where: { subscriptionId },
          include: { user: true },
        })

        if (!subscription) {
          return {
            success: false,
            message: `Subscription ${subscriptionId} not found`,
          }
        }

        // Update subscription status if provided
        const updateData: Parameters<
          typeof database.paymentSubscription.update
        >[0]["data"] = {
          lastWebhookAt: new Date(),
          webhookCount: { increment: 1 },
        }

        if (attributes.status) {
          updateData.status =
            SubscriptionEntity.convertLemonSqueezyStatusToInternal(
              attributes.status
            )
        }

        const updatedSubscription = await database.paymentSubscription.update({
          where: { subscriptionId },
          data: updateData,
        })

        // Create payment transaction for failed payment
        const now = new Date()
        await database.paymentTransaction.create({
          data: {
            transactionId: `txn-failed-${subscriptionId}-${now.getTime()}`,
            subscriptionId: subscription.id,
            amount: subscription.price,
            currency: subscription.currency,
            status: PaymentTransactionStatus.FAILED,
            description: "Subscription payment failed",
            paymentDate: null,
            failureReason: "Payment processing failed",
            metadata: {
              retryDate: attributes.renews_at,
            },
          },
        })

        // Create subscription history entry if status changed
        if (attributes.status) {
          const newStatus =
            SubscriptionEntity.convertLemonSqueezyStatusToInternal(
              attributes.status
            )
          if (subscription.status !== newStatus) {
            await database.paymentSubscriptionHistory.create({
              data: {
                subscriptionId: updatedSubscription.id,
                previousStatus: subscription.status,
                newStatus,
                reason: "Payment failed - status updated",
                changedBy: SubscriptionChangeSource.WEBHOOK,
                metadata: {
                  eventType: "subscription_payment_failed",
                },
              },
            })
          }
        }

        return {
          success: true,
          message: `Payment failure event processed for subscription ${subscriptionId}`,
        }
      }

      /**
       * Handles recovered subscription payment event (failed payment was later successful)
       *
       * Actions performed:
       * 1. Creates payment transaction record (SUCCESS status)
       * 2. Creates invoice for the recovered transaction
       * 3. Creates subscription history entry
       * 4. Updates subscription status back to ACTIVE
       * 5. Restores user plan to PRO
       *
       * Deferred: Send payment recovered confirmation email (see LINEAR_ISSUE_WEBHOOK_IMPROVEMENTS.md)
       */
      case lemonSqueezyEventTypeEnum.subscription_payment_recovered: {
        const subscription = await database.paymentSubscription.findUnique({
          where: { subscriptionId },
          include: { user: true },
        })

        if (!subscription) {
          return {
            success: false,
            message: `Subscription ${subscriptionId} not found`,
          }
        }

        const previousStatus = subscription.status
        const recoveredStatus =
          SubscriptionEntity.convertLemonSqueezyStatusToInternal(
            attributes.status
          )

        // Update subscription status and metadata
        const updatedSubscription = await database.paymentSubscription.update({
          where: { subscriptionId },
          data: {
            status: recoveredStatus,
            renewsAt: attributes.renews_at
              ? new Date(attributes.renews_at)
              : null,
            lastWebhookAt: new Date(),
            webhookCount: { increment: 1 },
          },
        })

        // Create payment transaction for recovered payment
        const now = new Date()
        const billingPeriodStart = subscription.renewsAt
          ? new Date(subscription.renewsAt)
          : new Date(now.getFullYear(), now.getMonth(), 1)
        const billingPeriodEnd = attributes.renews_at
          ? new Date(attributes.renews_at)
          : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

        const transaction = await database.paymentTransaction.create({
          data: {
            transactionId: `txn-recovered-${subscriptionId}-${now.getTime()}`,
            subscriptionId: subscription.id,
            amount: subscription.price,
            currency: subscription.currency,
            status: PaymentTransactionStatus.SUCCESS,
            description: "Recovered subscription payment",
            paymentDate: now,
            billingPeriodStart,
            billingPeriodEnd,
            metadata: {
              recovered: true,
            },
          },
        })

        // Create invoice for recovered transaction
        const invoiceNumber = `INV-${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}-${String(transaction.id.slice(-6)).toUpperCase()}`
        await database.invoice.create({
          data: {
            invoiceNumber,
            subscriptionId: subscription.id,
            transactionId: transaction.id,
            amount: subscription.price,
            currency: subscription.currency,
            status: InvoiceStatus.PAID,
            dueDate: billingPeriodStart,
            paidAt: now,
            billingPeriodStart,
            billingPeriodEnd,
            notes: "Recovered subscription payment invoice",
          },
        })

        // Create subscription history entry for recovery
        await database.paymentSubscriptionHistory.create({
          data: {
            subscriptionId: updatedSubscription.id,
            previousStatus,
            newStatus: recoveredStatus,
            reason: "Payment recovered after failure",
            changedBy: SubscriptionChangeSource.WEBHOOK,
            metadata: {
              eventType: "subscription_payment_recovered",
            },
          },
        })

        // Restore user plan to PRO when payment is recovered
        await database.user.update({
          where: { id: subscription.userId },
          data: { plan: UserPlan.PRO },
        })

        return {
          success: true,
          message: `Payment recovered event processed for subscription ${subscriptionId}`,
        }
      }

      default:
        return {
          success: true,
          message: `Event type ${lemonSqueezyEventTypeEnum[eventType]} not processed`,
        }
    }
  } catch (error) {
    console.error(
      `Error processing ${eventType} for subscription ${subscriptionId}:`,
      error
    )
    return {
      success: false,
      message: `Error processing ${eventType}: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

/**
 * Webhook handler for processing Lemon Squeezy subscription events
 *
 * @route POST /api/orpc/webhooks/handle
 * @requires Header `x-signature` - Webhook signature for verification
 * @returns Promise<WebhookOutput> - Success status, message, and processed flag
 *
 * @description
 * This handler processes external webhook POST requests from Lemon Squeezy.
 * It does NOT use `.input()` validation because external webhooks send raw JSON
 * that doesn't match oRPC's expected request format.
 *
 * **Request Flow:**
 * 1. Request arrives at `/api/orpc/webhooks/handle`
 * 2. Route handler parses JSON body and adds to `context.body`
 * 3. Middleware verifies `x-signature` header
 * 4. This handler reads `context.body`, validates with Zod, and processes event
 *
 * **Why not use `.input()` validation?**
 * - `.input()` expects oRPC client-formatted requests
 * - External webhooks send plain JSON: `{"payload": {...}}`
 * - This mismatch causes validation failure (400 "input undefined")
 *
 * **Workaround implemented:**
 * - Parse body in route handler before oRPC processing
 * - Store parsed body in `context.body` for manual validation
 * - Validate using `webhookInputSchema.parse()` in the handler
 *
 * @example
 * ```bash
 * curl -X POST https://your-domain.com/api/orpc/webhooks/handle \
 *   -H "Content-Type: application/json" \
 *   -H "x-signature: your-signature" \
 *   -d '{"payload": {...}}'
 * ```
 *
 * @see {@link webhookInputSchema} - Input validation schema
 * @see {@link processSubscriptionEvent} - Event processing logic
 */
export const handleWebhook = webhookProcedure
  .output(webhookOutputSchema)
  .handler(async ({ context }): Promise<WebhookOutput> => {
    try {
      // Get parsed body from context (added by route handler)
      const parsedBody = context.body
      if (!parsedBody) {
        return {
          success: false,
          message: "No body in context",
          processed: false,
        }
      }

      // Validate the parsed body
      const input = webhookInputSchema.parse(parsedBody)
      const { payload } = input
      const eventType = payload.meta.event_name

      console.log(`Received Lemon Squeezy webhook: ${eventType}`)

      // Process subscription webhooks
      if (eventType.startsWith("subscription_")) {
        const result = await processSubscriptionEvent(
          eventType,
          payload.data,
          payload.meta.custom_data
        )
        return {
          success: result.success,
          message: result.message,
          processed: true,
        }
      }

      return {
        success: true,
        message: `Event type ${eventType} not supported`,
        processed: false,
      }
    } catch (error) {
      console.error("Webhook processing error:", error)

      // Re-throw ORPC errors to let ORPC handle them
      if (error instanceof ORPCError) {
        throw error
      }

      return {
        success: false,
        message: `Webhook processing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        processed: false,
      }
    }
  })

// Export the webhook router
export const webhookRouter = {
  handle: handleWebhook,
}
