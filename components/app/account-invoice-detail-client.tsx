"use client"

import { useInvoice } from "@/orpc/hooks/use-subscriptions"
import type { InvoiceIncludeOutput } from "@/schemas/subscription"

import { AccountInvoiceDetailHeader } from "@/components/app/account-invoice-detail-header"
import { AccountInvoiceDetailInfo } from "@/components/app/account-invoice-detail-info"
import { AccountInvoiceDetailPreview } from "@/components/app/account-invoice-detail-preview"
import { Skeleton } from "@/components/ui/skeleton"

interface AccountInvoiceDetailClientProps {
  invoiceId: string
  initialData: InvoiceIncludeOutput
}

export function AccountInvoiceDetailClient({
  invoiceId,
  initialData,
}: AccountInvoiceDetailClientProps) {
  const { data: invoice, isLoading } = useInvoice(invoiceId, {
    initialData,
  })

  if (isLoading && !invoice) {
    return (
      <div className="space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="mx-auto h-[297mm] w-full max-w-[210mm]" />
      </div>
    )
  }

  if (!invoice) {
    return null
  }

  return (
    <div className="space-y-8 pb-12">
      <AccountInvoiceDetailHeader
        invoiceNumber={invoice.invoiceNumber}
        invoiceId={invoiceId}
      />
      <AccountInvoiceDetailInfo invoice={invoice} />
      <AccountInvoiceDetailPreview />
    </div>
  )
}
