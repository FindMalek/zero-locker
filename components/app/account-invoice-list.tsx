"use client"

import { invoiceStatusEnum, type InvoiceStatusInfer } from "@/schemas/subscription"
import type { InvoiceSimpleOutput } from "@/schemas/subscription"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface AccountInvoiceListProps {
  invoices: InvoiceSimpleOutput[]
  isLoading: boolean
}

export function AccountInvoiceList({
  invoices,
  isLoading,
}: AccountInvoiceListProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatPrice = (amount: number, currency: string) => {
    return `${amount} ${currency}`
  }

  const getStatusColor = (status: InvoiceStatusInfer) => {
    switch (status) {
      case invoiceStatusEnum.PAID:
        return "default"
      case invoiceStatusEnum.PENDING:
        return "secondary"
      case invoiceStatusEnum.OVERDUE:
        return "destructive"
      case invoiceStatusEnum.CANCELLED:
        return "outline"
      case invoiceStatusEnum.DRAFT:
        return "outline"
      default:
        return "outline"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No invoices found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <Card key={invoice.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Invoice #{invoice.invoiceNumber}</CardTitle>
              <Badge variant={getStatusColor(invoice.status)}>
                {invoice.status}
              </Badge>
            </div>
            <CardDescription>
              {formatPrice(invoice.amount, invoice.currency)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <p className="text-muted-foreground">Due Date</p>
                <p className="font-medium">{formatDate(invoice.dueDate)}</p>
              </div>
              {invoice.paidAt && (
                <div>
                  <p className="text-muted-foreground">Paid At</p>
                  <p className="font-medium">{formatDate(invoice.paidAt)}</p>
                </div>
              )}
              {invoice.billingPeriodStart && (
                <div>
                  <p className="text-muted-foreground">Billing Period Start</p>
                  <p className="font-medium">
                    {formatDate(invoice.billingPeriodStart)}
                  </p>
                </div>
              )}
              {invoice.billingPeriodEnd && (
                <div>
                  <p className="text-muted-foreground">Billing Period End</p>
                  <p className="font-medium">{formatDate(invoice.billingPeriodEnd)}</p>
                </div>
              )}
            </div>
            {invoice.notes && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="text-sm">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

