"use client"

import { useMemo } from "react"
import { orpc } from "@/orpc/client"
import type {
  GetSubscriptionHistoryInput,
  GetSubscriptionInvoicesInput,
  GetSubscriptionTransactionsInput,
  ListInvoicesOutput,
  ListSubscriptionHistoryOutput,
  ListSubscriptionsInput,
  ListSubscriptionsOutput,
  ListTransactionsOutput,
  SubscriptionIncludeOutput,
} from "@/schemas/subscription"
import {
  useQueries,
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query"

// Query keys factory
export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  lists: () => [...subscriptionKeys.all, "list"] as const,
  list: (filters: Partial<ListSubscriptionsInput>) =>
    [...subscriptionKeys.lists(), filters] as const,
  details: () => [...subscriptionKeys.all, "detail"] as const,
  detail: (id: string) => [...subscriptionKeys.details(), id] as const,
  invoices: (subscriptionId: string) =>
    [...subscriptionKeys.detail(subscriptionId), "invoices"] as const,
  transactions: (subscriptionId: string) =>
    [...subscriptionKeys.detail(subscriptionId), "transactions"] as const,
  history: (subscriptionId: string) =>
    [...subscriptionKeys.detail(subscriptionId), "history"] as const,
}

// Get single subscription
export function useSubscription(
  id: string,
  options?: Omit<
    UseQueryOptions<SubscriptionIncludeOutput>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: subscriptionKeys.detail(id),
    queryFn: () => orpc.subscriptions.get.call({ id }),
    enabled: !!id,
    ...options,
  })
}

// List subscriptions with pagination
export function useSubscriptions(
  input: ListSubscriptionsInput = { page: 1, limit: 10 },
  options?: Omit<
    UseQueryOptions<ListSubscriptionsOutput>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: subscriptionKeys.list(input),
    queryFn: () => orpc.subscriptions.list.call(input),
    placeholderData: (previousData) => previousData,
    ...options,
  })
}

// Get invoices for a subscription
export function useSubscriptionInvoices(
  input: GetSubscriptionInvoicesInput,
  options?: Omit<UseQueryOptions<ListInvoicesOutput>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: subscriptionKeys.invoices(input.subscriptionId),
    queryFn: () => orpc.subscriptions.getInvoices.call(input),
    enabled: !!input.subscriptionId,
    placeholderData: (previousData) => previousData,
    ...options,
  })
}

// Get transactions for a subscription
export function useSubscriptionTransactions(
  input: GetSubscriptionTransactionsInput,
  options?: Omit<
    UseQueryOptions<ListTransactionsOutput>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: subscriptionKeys.transactions(input.subscriptionId),
    queryFn: () => orpc.subscriptions.getTransactions.call(input),
    enabled: !!input.subscriptionId,
    placeholderData: (previousData) => previousData,
    ...options,
  })
}

// Get subscription history
export function useSubscriptionHistory(
  input: GetSubscriptionHistoryInput,
  options?: Omit<
    UseQueryOptions<ListSubscriptionHistoryOutput>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: subscriptionKeys.history(input.subscriptionId),
    queryFn: () => orpc.subscriptions.getHistory.call(input),
    enabled: !!input.subscriptionId,
    placeholderData: (previousData) => previousData,
    ...options,
  })
}

// Get all invoices from all subscriptions
export function useAllSubscriptionInvoices(
  subscriptionIds: string[],
  options?: {
    page?: number
    limit?: number
  }
) {
  const { page = 1, limit = 100 } = options ?? {}

  const invoiceQueries = useQueries({
    queries: subscriptionIds.map((subscriptionId) => ({
      queryKey: subscriptionKeys.invoices(subscriptionId),
      queryFn: () =>
        orpc.subscriptions.getInvoices.call({
          subscriptionId,
          page,
          limit,
        }),
      enabled: !!subscriptionId,
    })),
  })

  const allInvoices = useMemo(() => {
    return invoiceQueries
      .flatMap((query) => query.data?.invoices ?? [])
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }, [invoiceQueries])

  const isLoading = invoiceQueries.some((query) => query.isLoading)
  const isError = invoiceQueries.some((query) => query.isError)

  return {
    invoices: allInvoices,
    isLoading,
    isError,
  }
}
