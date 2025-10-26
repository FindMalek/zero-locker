import { webhookSignatureMiddleware } from "@/middleware/webhook"
import { database } from "@/prisma/client"
import {
  lemonSqueezyEventTypeEnum,
  mapLemonSqueezyStatusToInternal,
  webhookInputSchema,
  webhookOutputSchema,
  type LemonSqueezyEventType,
  type WebhookInput,
  type WebhookOutput,
} from "@/schemas/utils"
import { ORPCError, os } from "@orpc/server"

import type { ORPCContext } from "../types"

const baseProcedure = os.$context<ORPCContext>()

// Public webhook procedure with signature verification middleware
const webhookProcedure = baseProcedure.use(webhookSignatureMiddleware)

// Process subscription events
async function processSubscriptionEvent(
  eventType: LemonSqueezyEventType,
  subscriptionData: any
): Promise<{ success: boolean; message: string }> {
  const subscriptionId = subscriptionData.id
  const attributes = subscriptionData.attributes

  try {
    switch (eventType) {
      case lemonSqueezyEventTypeEnum.subscription_created: {
        // Find the user by email or customer ID
        const user = await database.user.findFirst({
          where: {
            OR: [
              { email: attributes.user_email },
              { id: attributes.custom_data?.userId },
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

        if (!product) {
          // Create product if it doesn't exist
          product = await database.paymentProduct.create({
            data: {
              productId: attributes.product_id,
              variantId: attributes.variant_id,
              name: attributes.product_name || "Unknown Product",
              description: attributes.product_description,
              price: attributes.price,
              currency: attributes.currency?.toUpperCase() || "USD",
              interval: attributes.renewal_interval?.toUpperCase() || "MONTHLY",
            },
          })
        }

        // Create subscription
        await database.paymentSubscription.create({
          data: {
            subscriptionId,
            orderId: attributes.order_id,
            customerId: attributes.customer_id,
            status: mapLemonSqueezyStatusToInternal(attributes.status),
            productId: product.id,
            price: attributes.price,
            currency: attributes.currency?.toUpperCase() || "USD",
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

        return {
          success: true,
          message: `Subscription ${subscriptionId} created successfully`,
        }
      }

      case lemonSqueezyEventTypeEnum.subscription_updated:
      case lemonSqueezyEventTypeEnum.subscription_cancelled:
      case lemonSqueezyEventTypeEnum.subscription_resumed:
      case lemonSqueezyEventTypeEnum.subscription_expired:
      case lemonSqueezyEventTypeEnum.subscription_paused:
      case lemonSqueezyEventTypeEnum.subscription_unpaused: {
        const subscription = await database.paymentSubscription.findUnique({
          where: { subscriptionId },
        })

        if (!subscription) {
          return {
            success: false,
            message: `Subscription ${subscriptionId} not found`,
          }
        }

        // Update subscription status and metadata
        await database.paymentSubscription.update({
          where: { subscriptionId },
          data: {
            status: mapLemonSqueezyStatusToInternal(attributes.status),
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

        return {
          success: true,
          message: `Subscription ${subscriptionId} updated successfully`,
        }
      }

      case lemonSqueezyEventTypeEnum.subscription_payment_success:
      case lemonSqueezyEventTypeEnum.subscription_payment_failed:
      case lemonSqueezyEventTypeEnum.subscription_payment_recovered: {
        const subscription = await database.paymentSubscription.findUnique({
          where: { subscriptionId },
        })

        if (!subscription) {
          return {
            success: false,
            message: `Subscription ${subscriptionId} not found`,
          }
        }

        // Update webhook metadata
        await database.paymentSubscription.update({
          where: { subscriptionId },
          data: {
            lastWebhookAt: new Date(),
            webhookCount: { increment: 1 },
            // Update renewsAt for successful payments
            ...(eventType === "subscription_payment_success" && {
              renewsAt: attributes.renews_at
                ? new Date(attributes.renews_at)
                : null,
            }),
          },
        })

        return {
          success: true,
          message: `Payment event processed for subscription ${subscriptionId}`,
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

// Main webhook handler
export const handleWebhook = webhookProcedure
  .input(webhookInputSchema)
  .output(webhookOutputSchema)
  .handler(async ({ input }): Promise<WebhookOutput> => {
    try {
      const { payload } = input
      const eventType = payload.meta.event_name

      console.log(`Received Lemon Squeezy webhook: ${eventType}`)

      // Process the webhook based on event type
      if (eventType.startsWith("subscription_")) {
        const result = await processSubscriptionEvent(eventType, payload.data)
        return {
          success: result.success,
          message: result.message,
          processed: true,
        }
      }

      // Handle order events if needed in the future
      if (eventType.startsWith("order_")) {
        console.log(`Order event ${eventType} received but not processed`)
        return {
          success: true,
          message: `Order event ${eventType} received but not processed`,
          processed: false,
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
