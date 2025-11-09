"use client"

import type { InvoiceIncludeOutput } from "@/schemas/subscription"

import {
  getInvoiceStatusColor,
  getTransactionStatusColor,
} from "@/config/converter"
import { DateFormatter } from "@/lib/date-utils"
import { formatCurrency } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface AccountInvoiceDetailInfoProps {
  invoice: InvoiceIncludeOutput
}

export function AccountInvoiceDetailInfo({
  invoice,
}: AccountInvoiceDetailInfoProps) {
  return (
    <div className="space-y-6">
      {/* Key Information - Prominent Display */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">
                {formatCurrency(invoice.amount, invoice.currency)}
              </CardTitle>
              <CardDescription className="text-sm">
                Invoice #{invoice.invoiceNumber}
              </CardDescription>
            </div>
            <Badge
              variant={getInvoiceStatusColor(invoice.status)}
              className="text-sm"
            >
              {invoice.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            {invoice.dueDate && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium">
                  Due Date
                </p>
                <p className="text-sm font-medium">
                  {DateFormatter.formatLongDate(invoice.dueDate)}
                </p>
              </div>
            )}
            {invoice.paidAt && (
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium">
                  Paid At
                </p>
                <p className="text-sm font-medium">
                  {DateFormatter.formatLongDate(invoice.paidAt)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing Details */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Details</CardTitle>
          <CardDescription>
            Subscription and billing period information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs font-medium">
              Subscription
            </p>
            <p className="text-sm font-medium">
              {invoice.subscription.product.name}
            </p>
          </div>
          {invoice.billingPeriodStart && invoice.billingPeriodEnd && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium">
                  Billing Period
                </p>
                <p className="text-sm font-medium">
                  {DateFormatter.formatLongDate(invoice.billingPeriodStart)} -{" "}
                  {DateFormatter.formatLongDate(invoice.billingPeriodEnd)}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details */}
      {invoice.transaction && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>Payment transaction information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-medium">
                Transaction ID
              </p>
              <p className="font-mono text-sm font-medium">
                {invoice.transaction.transactionId}
              </p>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-medium">
                Status
              </p>
              <Badge
                variant={getTransactionStatusColor(invoice.transaction.status)}
                className="text-sm"
              >
                {invoice.transaction.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
