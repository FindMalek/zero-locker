"use client"

import Link from "next/link"
import { useInvoice } from "@/orpc/hooks/use-subscriptions"
import type { InvoiceIncludeOutput } from "@/schemas/subscription"
import {
  getInvoiceStatusColor,
  getTransactionStatusColor,
} from "@/config/converter"
import { DateFormatter } from "@/lib/date-utils"
import { formatCurrency } from "@/lib/utils"

import { AccountPageHeader } from "@/components/app/account-page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
      <div className="space-y-16 pb-12">
        <AccountPageHeader
          title="Invoice Details"
          description="View invoice information and billing details"
        />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invoice) {
    return null
  }

  return (
    <div className="space-y-16 pb-12">
      <div className="flex items-center justify-between">
        <AccountPageHeader
          title={`Invoice #${invoice.invoiceNumber}`}
          description="Invoice details and billing information"
        />
        <Badge variant={getInvoiceStatusColor(invoice.status)}>
          {invoice.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
            <CardDescription>Invoice details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">
                Invoice Number
              </p>
              <p className="font-mono text-sm">{invoice.invoiceNumber}</p>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">Amount</p>
              <p className="text-2xl font-bold">
                {formatCurrency(invoice.amount, invoice.currency)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">Status</p>
              <Badge variant={getInvoiceStatusColor(invoice.status)}>
                {invoice.status}
              </Badge>
            </div>
            {invoice.dueDate && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  Due Date
                </p>
                <p className="text-sm">
                  {DateFormatter.formatLongDate(invoice.dueDate)}
                </p>
              </div>
            )}
            {invoice.paidAt && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  Paid At
                </p>
                <p className="text-sm">
                  {DateFormatter.formatLongDate(invoice.paidAt)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Period</CardTitle>
            <CardDescription>Subscription billing information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invoice.billingPeriodStart && invoice.billingPeriodEnd && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  Billing Period
                </p>
                <p className="text-sm">
                  {DateFormatter.formatLongDate(invoice.billingPeriodStart)} -{" "}
                  {DateFormatter.formatLongDate(invoice.billingPeriodEnd)}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">
                Subscription
              </p>
              <p className="text-sm">{invoice.subscription.product.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">
                Created At
              </p>
              <p className="text-sm">
                {DateFormatter.formatLongDate(invoice.createdAt)}
              </p>
            </div>
            {invoice.notes && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">Notes</p>
                <p className="text-sm">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {invoice.transaction && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>Payment transaction information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">
                Transaction ID
              </p>
              <p className="font-mono text-sm">{invoice.transaction.transactionId}</p>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">Status</p>
              <Badge variant={getTransactionStatusColor(invoice.transaction.status)}>
                {invoice.transaction.status}
              </Badge>
            </div>
            {invoice.transaction.paymentDate && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  Payment Date
                </p>
                <p className="text-sm">
                  {DateFormatter.formatLongDate(invoice.transaction.paymentDate)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link href="/account/invoices">Back to Invoices</Link>
        </Button>
        {invoice.subscription && (
          <Button variant="outline" asChild>
            <Link href={`/account/subscription`}>View Subscription</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

