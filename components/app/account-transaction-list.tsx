"use client"

import {
  paymentTransactionStatusEnum,
  type PaymentTransactionStatusInfer,
} from "@/schemas/subscription"
import type { TransactionSimpleOutput } from "@/schemas/subscription"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface AccountTransactionListProps {
  transactions: TransactionSimpleOutput[]
  isLoading: boolean
}

export function AccountTransactionList({
  transactions,
  isLoading,
}: AccountTransactionListProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (amount: number, currency: string) => {
    return `${amount} ${currency}`
  }

  const getStatusColor = (status: PaymentTransactionStatusInfer) => {
    switch (status) {
      case paymentTransactionStatusEnum.SUCCESS:
        return "default"
      case paymentTransactionStatusEnum.PENDING:
        return "secondary"
      case paymentTransactionStatusEnum.FAILED:
        return "destructive"
      case paymentTransactionStatusEnum.REFUNDED:
        return "outline"
      case paymentTransactionStatusEnum.PARTIALLY_REFUNDED:
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

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No transactions found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card key={transaction.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transaction {transaction.transactionId}</CardTitle>
              <Badge variant={getStatusColor(transaction.status)}>
                {transaction.status}
              </Badge>
            </div>
            <CardDescription>
              {formatPrice(transaction.amount, transaction.currency)}
              {transaction.refundAmount && (
                <span className="text-destructive ml-2">
                  (Refunded:{" "}
                  {formatPrice(transaction.refundAmount, transaction.currency)})
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-4 text-sm md:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Payment Date</p>
                <p className="font-medium">
                  {formatDate(transaction.paymentDate)}
                </p>
              </div>
              {transaction.refundedAt && (
                <div>
                  <p className="text-muted-foreground">Refunded At</p>
                  <p className="font-medium">
                    {formatDate(transaction.refundedAt)}
                  </p>
                </div>
              )}
              {transaction.billingPeriodStart && (
                <div>
                  <p className="text-muted-foreground">Billing Period Start</p>
                  <p className="font-medium">
                    {formatDate(transaction.billingPeriodStart)}
                  </p>
                </div>
              )}
              {transaction.billingPeriodEnd && (
                <div>
                  <p className="text-muted-foreground">Billing Period End</p>
                  <p className="font-medium">
                    {formatDate(transaction.billingPeriodEnd)}
                  </p>
                </div>
              )}
            </div>
            {transaction.description && (
              <div className="mt-2">
                <p className="text-muted-foreground text-sm">Description</p>
                <p className="text-sm">{transaction.description}</p>
              </div>
            )}
            {transaction.failureReason && (
              <div className="mt-2">
                <p className="text-destructive text-sm font-medium">
                  Failure Reason
                </p>
                <p className="text-destructive text-sm">
                  {transaction.failureReason}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
