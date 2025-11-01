import { SubscriptionStatus } from "@prisma/client"
import { z } from "zod"

import {
  currencySchema,
  subscriptionIntervalEnum,
  subscriptionIntervalSchema,
} from "../subscription/enums"

// ============================================================================
// Lemon Squeezy Webhook Event Types
// ============================================================================

// Lemon Squeezy webhook event types (subscription events only)
export const lemonSqueezyEventTypeSchema = z.enum([
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_resumed",
  "subscription_expired",
  "subscription_paused",
  "subscription_unpaused",
  "subscription_payment_success",
  "subscription_payment_failed",
  "subscription_payment_recovered",
])

export const lemonSqueezyEventTypeEnum = lemonSqueezyEventTypeSchema.enum
export type LemonSqueezyEventType = z.infer<typeof lemonSqueezyEventTypeSchema>

// ============================================================================
// Lemon Squeezy Subscription Status (as received from webhooks)
// ============================================================================

// Lemon Squeezy subscription status values (as received from webhooks)
// Note: These are in snake_case format from Lemon Squeezy API
export const lemonSqueezySubscriptionStatusSchema = z.enum([
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.ON_TRIAL,
  SubscriptionStatus.PAST_DUE,
  SubscriptionStatus.UNPAID,
  SubscriptionStatus.CANCELLED,
  SubscriptionStatus.EXPIRED,
  SubscriptionStatus.PAUSED,
])

export const lemonSqueezySubscriptionStatusEnum =
  lemonSqueezySubscriptionStatusSchema.enum
export type LemonSqueezySubscriptionStatus = z.infer<
  typeof lemonSqueezySubscriptionStatusSchema
>

// ============================================================================
// Lemon Squeezy Webhook Attributes Schema
// ============================================================================

// Typed subscription attributes schema from Lemon Squeezy webhooks
export const lemonSqueezySubscriptionAttributesSchema = z.object({
  customer_id: z.string(),
  user_email: z.string().email().optional(),
  order_id: z.string(),
  product_id: z.string(),
  product_name: z.string().optional(),
  product_description: z.string().optional().nullable(),
  variant_id: z.string(),
  price: z.number(), // Price in cents
  currency: currencySchema,
  renewal_interval: subscriptionIntervalSchema,
  status: lemonSqueezySubscriptionStatusSchema,
  renews_at: z.string().datetime().nullable().optional(),
  ends_at: z.string().datetime().nullable().optional(),
  trial_ends_at: z.string().datetime().nullable().optional(),
})

export type LemonSqueezySubscriptionAttributes = z.infer<
  typeof lemonSqueezySubscriptionAttributesSchema
>

// ============================================================================
// Lemon Squeezy Webhook Payload Schema
// ============================================================================

// Lemon Squeezy webhook payload schema with typed subscription attributes
export const lemonSqueezyWebhookPayloadSchema = z.object({
  meta: z.object({
    event_name: lemonSqueezyEventTypeSchema,
    custom_data: z
      .object({
        userId: z.string().optional(),
      })
      .optional(),
  }),
  data: z.object({
    type: z.literal("subscriptions"),
    id: z.string(),
    attributes: lemonSqueezySubscriptionAttributesSchema,
    relationships: z.record(z.any()).optional(),
  }),
})

export type LemonSqueezyWebhookPayload = z.infer<
  typeof lemonSqueezyWebhookPayloadSchema
>

// ============================================================================
// Webhook Input Schema
// ============================================================================

// Webhook input schema for the API endpoint
export const webhookInputSchema = z.object({
  payload: lemonSqueezyWebhookPayloadSchema,
})

export type WebhookInput = z.infer<typeof webhookInputSchema>
