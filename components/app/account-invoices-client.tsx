"use client"

import { useEffect } from "react"
import {
  useAllSubscriptionInvoices,
  useSubscriptions,
} from "@/orpc/hooks/use-subscriptions"
import type { ListSubscriptionsOutput } from "@/schemas/subscription"
import { useQueryClient } from "@tanstack/react-query"

import { AccountInvoiceList } from "@/components/app/account-invoice-list"
import { AccountPageHeader } from "@/components/app/account-page-header"

interface AccountInvoicesClientProps {
  initialSubscriptions: ListSubscriptionsOutput
}

export function AccountInvoicesClient({
  initialSubscriptions,
}: AccountInvoicesClientProps) {
  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.setQueryData(
      ["subscriptions", "list", { page: 1, limit: 100 }],
      initialSubscriptions
    )
  }, [initialSubscriptions, queryClient])

  const { data: subscriptionsData } = useSubscriptions(
    { page: 1, limit: 100 },
    { initialData: initialSubscriptions }
  )

  const subscriptions = subscriptionsData?.subscriptions ?? []

  // Fetch invoices for all subscriptions in parallel
  const { invoices: allInvoices, isLoading: isLoadingInvoices } =
    useAllSubscriptionInvoices(
      subscriptions.map((subscription) => subscription.id),
      { page: 1, limit: 100 }
    )

  return (
    <div className="space-y-16 pb-12">
      <AccountPageHeader
        title="Invoice History"
        description="View and download all your invoices"
      />

      <AccountInvoiceList
        invoices={allInvoices}
        isLoading={isLoadingInvoices}
      />
    </div>
  )
}
