import { z } from "zod"

import {
  currencySchema,
  invoiceStatusSchema,
  paymentTransactionStatusSchema,
  subscriptionChangeSourceSchema,
  subscriptionIntervalSchema,
  subscriptionStatusSchema,
} from "./enums"

// ============================================================================
// Product Output Schemas
// ============================================================================

export const productSimpleOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(), // Decimal as number
  productId: z.string(),
  variantId: z.string(),
  currency: currencySchema,
  interval: subscriptionIntervalSchema,
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type ProductSimpleOutput = z.infer<typeof productSimpleOutputSchema>

// ============================================================================
// Subscription Output Schemas
// ============================================================================

export const subscriptionSimpleOutputSchema = z.object({
  id: z.string(),
  subscriptionId: z.string(),
  orderId: z.string(),
  customerId: z.string(),
  status: subscriptionStatusSchema,
  productId: z.string(),
  price: z.number(), // Decimal as number
  currency: currencySchema,
  endsAt: z.date().nullable(),
  renewsAt: z.date().nullable(),
  trialEndsAt: z.date().nullable(),
  cancelledReason: z.string().nullable(),
  cancelledAt: z.date().nullable(),
  userId: z.string(),
  lastWebhookAt: z.date().nullable(),
  webhookCount: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type SubscriptionSimpleOutput = z.infer<
  typeof subscriptionSimpleOutputSchema
>

export const subscriptionIncludeOutputSchema =
  subscriptionSimpleOutputSchema.extend({
    product: productSimpleOutputSchema,
  })

export type SubscriptionIncludeOutput = z.infer<
  typeof subscriptionIncludeOutputSchema
>

// ============================================================================
// List Subscriptions Output Schema
// ============================================================================

export const listSubscriptionsOutputSchema = z.object({
  subscriptions: z.array(subscriptionIncludeOutputSchema),
  total: z.number().int(),
  hasMore: z.boolean(),
  page: z.number().int(),
  limit: z.number().int(),
})

export type ListSubscriptionsOutput = z.infer<
  typeof listSubscriptionsOutputSchema
>

// ============================================================================
// Transaction Output Schemas
// ============================================================================

export const transactionSimpleOutputSchema = z.object({
  id: z.string(),
  transactionId: z.string(),
  subscriptionId: z.string(),
  amount: z.number(), // Decimal as number
  currency: currencySchema,
  status: paymentTransactionStatusSchema,
  description: z.string().nullable(),
  paymentDate: z.date().nullable(),
  refundedAt: z.date().nullable(),
  refundAmount: z.number().nullable(), // Decimal as number
  billingPeriodStart: z.date().nullable(),
  billingPeriodEnd: z.date().nullable(),
  failureReason: z.string().nullable(),
  metadata: z.record(z.any()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type TransactionSimpleOutput = z.infer<
  typeof transactionSimpleOutputSchema
>

export const listTransactionsOutputSchema = z.object({
  transactions: z.array(transactionSimpleOutputSchema),
  total: z.number().int(),
  hasMore: z.boolean(),
  page: z.number().int(),
  limit: z.number().int(),
})

export type ListTransactionsOutput = z.infer<
  typeof listTransactionsOutputSchema
>

// ============================================================================
// Invoice Output Schemas
// ============================================================================

export const invoiceSimpleOutputSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  subscriptionId: z.string(),
  amount: z.number(), // Decimal as number
  currency: currencySchema,
  status: invoiceStatusSchema,
  dueDate: z.date().nullable(),
  paidAt: z.date().nullable(),
  billingPeriodStart: z.date().nullable(),
  billingPeriodEnd: z.date().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type InvoiceSimpleOutput = z.infer<typeof invoiceSimpleOutputSchema>

export const invoiceIncludeOutputSchema = invoiceSimpleOutputSchema.extend({
  subscription: subscriptionIncludeOutputSchema,
  transaction: transactionSimpleOutputSchema.nullable(),
})

export type InvoiceIncludeOutput = z.infer<typeof invoiceIncludeOutputSchema>

export const transactionIncludeOutputSchema =
  transactionSimpleOutputSchema.extend({
    subscription: subscriptionSimpleOutputSchema,
    invoice: invoiceSimpleOutputSchema.nullable(),
  })

export type TransactionIncludeOutput = z.infer<
  typeof transactionIncludeOutputSchema
>

export const listInvoicesOutputSchema = z.object({
  invoices: z.array(invoiceSimpleOutputSchema),
  total: z.number().int(),
  hasMore: z.boolean(),
  page: z.number().int(),
  limit: z.number().int(),
})

export type ListInvoicesOutput = z.infer<typeof listInvoicesOutputSchema>

// ============================================================================
// Subscription History Output Schemas
// ============================================================================

export const subscriptionHistorySimpleOutputSchema = z.object({
  id: z.string(),
  subscriptionId: z.string(),
  previousStatus: subscriptionStatusSchema.nullable(),
  newStatus: subscriptionStatusSchema,
  previousPrice: z.number().nullable(), // Decimal as number
  newPrice: z.number().nullable(), // Decimal as number
  reason: z.string().nullable(),
  metadata: z.record(z.any()).nullable(),
  changedAt: z.date(),
  changedBy: subscriptionChangeSourceSchema.nullable(),
})

export type SubscriptionHistorySimpleOutput = z.infer<
  typeof subscriptionHistorySimpleOutputSchema
>

export const subscriptionHistoryIncludeOutputSchema =
  subscriptionHistorySimpleOutputSchema.extend({
    subscription: subscriptionSimpleOutputSchema,
  })

export type SubscriptionHistoryIncludeOutput = z.infer<
  typeof subscriptionHistoryIncludeOutputSchema
>

export const listSubscriptionHistoryOutputSchema = z.object({
  history: z.array(subscriptionHistorySimpleOutputSchema),
  total: z.number().int(),
  hasMore: z.boolean(),
  page: z.number().int(),
  limit: z.number().int(),
})

export type ListSubscriptionHistoryOutput = z.infer<
  typeof listSubscriptionHistoryOutputSchema
>
