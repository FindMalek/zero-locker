import { z } from "zod"
import { SubscriptionStatus } from "@prisma/client"

// Lemon Squeezy webhook event types
export const lemonSqueezyEventTypeSchema = z.enum([
  "order_created",
  "order_refunded",
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

// Lemon Squeezy subscription status values (as received from webhooks)
export const lemonSqueezySubscriptionStatusSchema = z.enum([
  "active",
  "on_trial", 
  "paused",
  "past_due",
  "unpaid",
  "cancelled",
  "expired",
])
export const lemonSqueezySubscriptionStatusEnum = lemonSqueezySubscriptionStatusSchema.enum

// Lemon Squeezy webhook payload schema
export const lemonSqueezyWebhookPayloadSchema = z.object({
  meta: z.object({
    event_name: lemonSqueezyEventTypeSchema,
    custom_data: z.record(z.any()).optional(),
  }),
  data: z.object({
    type: z.string(),
    id: z.string(),
    attributes: z.record(z.any()),
    relationships: z.record(z.any()).optional(),
  }),
})

// Webhook input schema for the API endpoint
export const webhookInputSchema = z.object({
  payload: lemonSqueezyWebhookPayloadSchema,
})

// Webhook output schema
export const webhookOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  processed: z.boolean(),
})

// Type exports
export type LemonSqueezyEventType = z.infer<typeof lemonSqueezyEventTypeSchema>
export type LemonSqueezySubscriptionStatus = z.infer<typeof lemonSqueezySubscriptionStatusSchema>
export type LemonSqueezyWebhookPayload = z.infer<typeof lemonSqueezyWebhookPayloadSchema>
export type WebhookInput = z.infer<typeof webhookInputSchema>
export type WebhookOutput = z.infer<typeof webhookOutputSchema>

// Helper function to map Lemon Squeezy status to our internal status
export function mapLemonSqueezyStatusToInternal(
  status: LemonSqueezySubscriptionStatus
): SubscriptionStatus {
  switch (status) {
    case lemonSqueezySubscriptionStatusEnum.active:
      return SubscriptionStatus.ACTIVE
    case lemonSqueezySubscriptionStatusEnum.on_trial:
      return SubscriptionStatus.ON_TRIAL
    case lemonSqueezySubscriptionStatusEnum.paused:
      return SubscriptionStatus.PAUSED
    case lemonSqueezySubscriptionStatusEnum.past_due:
      return SubscriptionStatus.PAST_DUE
    case lemonSqueezySubscriptionStatusEnum.unpaid:
      return SubscriptionStatus.UNPAID
    case lemonSqueezySubscriptionStatusEnum.cancelled:
      return SubscriptionStatus.CANCELLED
    case lemonSqueezySubscriptionStatusEnum.expired:
      return SubscriptionStatus.EXPIRED
  }
}
