"use client"

import Link from "next/link"
import type { InvoiceSimpleOutput } from "@/schemas/subscription"

import { getInvoiceStatusColor } from "@/config/converter"
import { DateFormatter } from "@/lib/date-utils"
import { formatCurrency } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"

interface AccountInvoiceCardProps {
  invoice: InvoiceSimpleOutput
}

export function AccountInvoiceCard({ invoice }: AccountInvoiceCardProps) {
  return (
    <Link
      href={`/account/invoices/${invoice.id}`}
      className="border-muted-foreground/20 bg-background hover:border-foreground/20 group block rounded-lg border p-4 transition-all hover:shadow-sm"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold">
              Invoice #{invoice.invoiceNumber}
            </h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">
              {formatCurrency(invoice.amount, invoice.currency)}
            </span>
            {invoice.dueDate && (
              <span className="text-muted-foreground text-xs">
                Due {DateFormatter.formatShortDate(invoice.dueDate)}
              </span>
            )}
          </div>
        </div>
        <Badge
          variant={getInvoiceStatusColor(invoice.status)}
          className="shrink-0"
        >
          {invoice.status}
        </Badge>
      </div>
    </Link>
  )
}
