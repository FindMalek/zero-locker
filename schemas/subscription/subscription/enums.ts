import {
  Currency,
  InvoiceStatus,
  PaymentTransactionStatus,
  SubscriptionChangeSource,
  SubscriptionInterval,
  SubscriptionStatus,
} from "@prisma/client"
import { z } from "zod"

// ============================================================================
// Subscription Status Enum
// ============================================================================

export const subscriptionStatusSchema = z.nativeEnum(SubscriptionStatus)

export const subscriptionStatusEnum = subscriptionStatusSchema.enum
export const LIST_SUBSCRIPTION_STATUSES = Object.values(subscriptionStatusEnum)
export type SubscriptionStatusInfer = z.infer<typeof subscriptionStatusSchema>

// ============================================================================
// Subscription Interval Enum
// ============================================================================

export const subscriptionIntervalSchema = z.nativeEnum(SubscriptionInterval)

export const subscriptionIntervalEnum = subscriptionIntervalSchema.enum
export const LIST_SUBSCRIPTION_INTERVALS = Object.values(
  subscriptionIntervalEnum
)
export type SubscriptionIntervalInfer = z.infer<
  typeof subscriptionIntervalSchema
>

// ============================================================================
// Currency Enum
// ============================================================================

export const currencySchema = z.nativeEnum(Currency)

export const currencyEnum = currencySchema.enum
export const LIST_CURRENCIES = Object.values(currencyEnum)
export type CurrencyInfer = z.infer<typeof currencySchema>

// ============================================================================
// Payment Transaction Status Enum
// ============================================================================

export const paymentTransactionStatusSchema = z.enum([
  PaymentTransactionStatus.PENDING,
  PaymentTransactionStatus.SUCCESS,
  PaymentTransactionStatus.FAILED,
  PaymentTransactionStatus.REFUNDED,
  PaymentTransactionStatus.PARTIALLY_REFUNDED,
])

export const paymentTransactionStatusEnum = paymentTransactionStatusSchema.enum
export const LIST_PAYMENT_TRANSACTION_STATUSES = Object.values(
  paymentTransactionStatusEnum
)
export type PaymentTransactionStatusInfer = z.infer<
  typeof paymentTransactionStatusSchema
>

// ============================================================================
// Invoice Status Enum
// ============================================================================

export const invoiceStatusSchema = z.enum([
  InvoiceStatus.DRAFT,
  InvoiceStatus.PENDING,
  InvoiceStatus.PAID,
  InvoiceStatus.OVERDUE,
  InvoiceStatus.CANCELLED,
])

export const invoiceStatusEnum = invoiceStatusSchema.enum
export const LIST_INVOICE_STATUSES = Object.values(invoiceStatusEnum)
export type InvoiceStatusInfer = z.infer<typeof invoiceStatusSchema>

// ============================================================================
// Subscription Change Source Enum
// ============================================================================

export const subscriptionChangeSourceSchema = z.enum([
  SubscriptionChangeSource.USER,
  SubscriptionChangeSource.SYSTEM,
  SubscriptionChangeSource.WEBHOOK,
  SubscriptionChangeSource.ADMIN,
])

export const subscriptionChangeSourceEnum = subscriptionChangeSourceSchema.enum
export const LIST_SUBSCRIPTION_CHANGE_SOURCES = Object.values(
  subscriptionChangeSourceEnum
)
export type SubscriptionChangeSourceInfer = z.infer<
  typeof subscriptionChangeSourceSchema
>
