"use client"

import { useEffect } from "react"
import Link from "next/link"
import {
  useAllSubscriptionInvoices,
  useSubscriptions,
} from "@/orpc/hooks/use-subscriptions"
import type { ListSubscriptionsOutput } from "@/schemas/subscription"
import { useQueryClient } from "@tanstack/react-query"

import { AccountInvoiceList } from "@/components/app/account-invoice-list"
import { AccountPageHeader } from "@/components/app/account-page-header"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"

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
    <div className="space-y-8">
      <AccountPageHeader
        title="Invoice History"
        description="View and download all your invoices"
      />

      <div>
        {allInvoices.length === 0 && !isLoadingInvoices ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Icons.post className="text-muted-foreground mb-4 size-12" />
            <p className="text-muted-foreground mb-2">No invoices found</p>
            <p className="text-muted-foreground text-sm">
              Invoices will appear here once you have active subscriptions
            </p>
          </div>
        ) : (
          <AccountInvoiceList
            invoices={allInvoices}
            isLoading={isLoadingInvoices}
          />
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href="/account">Back to Account</Link>
        </Button>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href="/account/subscription">View Subscription</Link>
        </Button>
      </div>
    </div>
  )
}
