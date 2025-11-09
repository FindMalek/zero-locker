"use client"

import type { InvoiceSimpleOutput } from "@/schemas/subscription"

import { AccountInvoiceCard } from "@/components/app/account-invoice-card"
import { AccountInvoiceEmptyState } from "@/components/app/account-invoice-empty-state"
import { AccountInvoiceListSkeleton } from "@/components/app/account-invoice-list-skeleton"

interface AccountInvoiceListProps {
  invoices: InvoiceSimpleOutput[]
  isLoading: boolean
}

export function AccountInvoiceList({
  invoices,
  isLoading,
}: AccountInvoiceListProps) {
  if (isLoading) {
    return <AccountInvoiceListSkeleton />
  }

  if (invoices.length === 0) {
    return <AccountInvoiceEmptyState />
  }

  return (
    <div className="space-y-3">
      {invoices.map((invoice) => (
        <AccountInvoiceCard key={invoice.id} invoice={invoice} />
      ))}
    </div>
  )
}
