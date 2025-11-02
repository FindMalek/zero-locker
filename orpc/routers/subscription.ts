import { InvoiceEntity, InvoiceQuery } from "@/entities/subscription/invoice"
import { SubscriptionHistoryEntity, SubscriptionHistoryQuery } from "@/entities/subscription/history"
import { SubscriptionEntity, SubscriptionQuery } from "@/entities/subscription/subscription"
import { TransactionEntity, TransactionQuery } from "@/entities/subscription/transaction"
import { authMiddleware } from "@/middleware/auth"
import { database } from "@/prisma/client"
import {
  getSubscriptionHistoryInputSchema,
  getSubscriptionInvoicesInputSchema,
  getSubscriptionInputSchema,
  getSubscriptionTransactionsInputSchema,
  listSubscriptionsInputSchema,
  listSubscriptionsOutputSchema,
  listInvoicesOutputSchema,
  listTransactionsOutputSchema,
  listSubscriptionHistoryOutputSchema,
  subscriptionIncludeOutputSchema,
  type ListSubscriptionsOutput,
  type ListInvoicesOutput,
  type ListTransactionsOutput,
  type ListSubscriptionHistoryOutput,
  type SubscriptionIncludeOutput,
} from "@/schemas/subscription"
import { ORPCError, os } from "@orpc/server"
import type { Prisma } from "@prisma/client"

import type { ORPCContext } from "../types"

const baseProcedure = os.$context<ORPCContext>()
const authProcedure = baseProcedure.use(({ context, next }) =>
  authMiddleware({ context, next })
)

// Get single subscription by ID
export const getSubscription = authProcedure
  .input(getSubscriptionInputSchema)
  .output(subscriptionIncludeOutputSchema)
  .handler(async ({ input, context }): Promise<SubscriptionIncludeOutput> => {
    const subscription = await database.paymentSubscription.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
      },
      include: SubscriptionQuery.getInclude(),
    })

    if (!subscription) {
      throw new ORPCError("NOT_FOUND")
    }

    return SubscriptionEntity.getRo(subscription)
  })

// List user subscriptions with pagination
export const listSubscriptions = authProcedure
  .input(listSubscriptionsInputSchema)
  .output(listSubscriptionsOutputSchema)
  .handler(async ({ input, context }): Promise<ListSubscriptionsOutput> => {
    const { page, limit, status } = input
    const skip = (page - 1) * limit

    const where: Prisma.PaymentSubscriptionWhereInput = {
      userId: context.user.id,
      ...(status && { status }),
    }

    const [subscriptions, total] = await Promise.all([
      database.paymentSubscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: SubscriptionQuery.getInclude(),
      }),
      database.paymentSubscription.count({ where }),
    ])

    return {
      subscriptions: subscriptions.map((subscription) =>
        SubscriptionEntity.getRo(subscription)
      ),
      total,
      hasMore: skip + subscriptions.length < total,
      page,
      limit,
    }
  })

// Get invoices for a subscription
export const getSubscriptionInvoices = authProcedure
  .input(getSubscriptionInvoicesInputSchema)
  .output(listInvoicesOutputSchema)
  .handler(async ({ input, context }): Promise<ListInvoicesOutput> => {
    const { subscriptionId, page, limit } = input
    const skip = (page - 1) * limit

    // Verify subscription ownership
    const subscription = await database.paymentSubscription.findFirst({
      where: {
        id: subscriptionId,
        userId: context.user.id,
      },
    })

    if (!subscription) {
      throw new ORPCError("NOT_FOUND")
    }

    const where: Prisma.InvoiceWhereInput = {
      subscriptionId,
    }

    const [invoices, total] = await Promise.all([
      database.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: InvoiceQuery.getSimpleInclude(),
      }),
      database.invoice.count({ where }),
    ])

    return {
      invoices: invoices.map((invoice) => InvoiceEntity.getSimpleRo(invoice)),
      total,
      hasMore: skip + invoices.length < total,
      page,
      limit,
    }
  })

// Get transactions for a subscription
export const getSubscriptionTransactions = authProcedure
  .input(getSubscriptionTransactionsInputSchema)
  .output(listTransactionsOutputSchema)
  .handler(async ({ input, context }): Promise<ListTransactionsOutput> => {
    const { subscriptionId, page, limit } = input
    const skip = (page - 1) * limit

    // Verify subscription ownership
    const subscription = await database.paymentSubscription.findFirst({
      where: {
        id: subscriptionId,
        userId: context.user.id,
      },
    })

    if (!subscription) {
      throw new ORPCError("NOT_FOUND")
    }

    const where: Prisma.PaymentTransactionWhereInput = {
      subscriptionId,
    }

    const [transactions, total] = await Promise.all([
      database.paymentTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: TransactionQuery.getSimpleInclude(),
      }),
      database.paymentTransaction.count({ where }),
    ])

    return {
      transactions: transactions.map((transaction) =>
        TransactionEntity.getSimpleRo(transaction)
      ),
      total,
      hasMore: skip + transactions.length < total,
      page,
      limit,
    }
  })

// Get subscription history
export const getSubscriptionHistory = authProcedure
  .input(getSubscriptionHistoryInputSchema)
  .output(listSubscriptionHistoryOutputSchema)
  .handler(async ({ input, context }): Promise<ListSubscriptionHistoryOutput> => {
    const { subscriptionId, page, limit } = input
    const skip = (page - 1) * limit

    // Verify subscription ownership
    const subscription = await database.paymentSubscription.findFirst({
      where: {
        id: subscriptionId,
        userId: context.user.id,
      },
    })

    if (!subscription) {
      throw new ORPCError("NOT_FOUND")
    }

    const where: Prisma.PaymentSubscriptionHistoryWhereInput = {
      subscriptionId,
    }

    const [history, total] = await Promise.all([
      database.paymentSubscriptionHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { changedAt: "desc" },
        include: SubscriptionHistoryQuery.getSimpleInclude(),
      }),
      database.paymentSubscriptionHistory.count({ where }),
    ])

    return {
      history: history.map((entry) =>
        SubscriptionHistoryEntity.getSimpleRo(entry)
      ),
      total,
      hasMore: skip + history.length < total,
      page,
      limit,
    }
  })

// Export the subscription router
export const subscriptionRouter = {
  get: getSubscription,
  list: listSubscriptions,
  getInvoices: getSubscriptionInvoices,
  getTransactions: getSubscriptionTransactions,
  getHistory: getSubscriptionHistory,
}

