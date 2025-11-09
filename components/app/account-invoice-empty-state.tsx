"use client"

import { Icons } from "@/components/shared/icons"

export function AccountInvoiceEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-muted-foreground/20 bg-muted/20 py-16">
      <Icons.fileList className="text-muted-foreground mb-4 size-12" />
      <p className="text-muted-foreground mb-2 text-sm font-medium">
        No invoices found
      </p>
      <p className="text-muted-foreground text-center text-xs max-w-sm">
        Invoices will appear here once you have active subscriptions
      </p>
    </div>
  )
}

