import { z } from "zod"

import { subscriptionStatusSchema } from "./enums"

// ============================================================================
// Get Subscription Input Schema
// ============================================================================

export const getSubscriptionInputSchema = z.object({
  id: z.string().min(1, "Subscription ID is required"),
})

export type GetSubscriptionInput = z.infer<typeof getSubscriptionInputSchema>

// ============================================================================
// List Subscriptions Input Schema
// ============================================================================

export const listSubscriptionsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  status: subscriptionStatusSchema.optional(),
})

export type ListSubscriptionsInput = z.infer<
  typeof listSubscriptionsInputSchema
>

// ============================================================================
// Get Subscription Invoices Input Schema
// ============================================================================

export const getSubscriptionInvoicesInputSchema = z.object({
  subscriptionId: z.string().min(1, "Subscription ID is required"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
})

export type GetSubscriptionInvoicesInput = z.infer<
  typeof getSubscriptionInvoicesInputSchema
>

// ============================================================================
// Get Subscription Transactions Input Schema
// ============================================================================

export const getSubscriptionTransactionsInputSchema = z.object({
  subscriptionId: z.string().min(1, "Subscription ID is required"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
})

export type GetSubscriptionTransactionsInput = z.infer<
  typeof getSubscriptionTransactionsInputSchema
>

// ============================================================================
// Get Subscription History Input Schema
// ============================================================================

export const getSubscriptionHistoryInputSchema = z.object({
  subscriptionId: z.string().min(1, "Subscription ID is required"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
})

export type GetSubscriptionHistoryInput = z.infer<
  typeof getSubscriptionHistoryInputSchema
>

// ============================================================================
// Get Invoice Input Schema
// ============================================================================

export const getInvoiceInputSchema = z.object({
  id: z.string().min(1, "Invoice ID is required"),
})

export type GetInvoiceInput = z.infer<typeof getInvoiceInputSchema>
