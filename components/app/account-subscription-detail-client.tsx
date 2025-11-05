"use client"

import { useState } from "react"
import Link from "next/link"
import {
  useSubscription,
  useSubscriptionHistory,
  useSubscriptionInvoices,
  useSubscriptionTransactions,
} from "@/orpc/hooks/use-subscriptions"
import {
  subscriptionStatusEnum,
  type SubscriptionStatusInfer,
} from "@/schemas/subscription"
import type { SubscriptionIncludeOutput } from "@/schemas/subscription"

import { AccountInvoiceList } from "@/components/app/account-invoice-list"
import { AccountSubscriptionHistoryList } from "@/components/app/account-subscription-history-list"
import { AccountTransactionList } from "@/components/app/account-transaction-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AccountSubscriptionDetailClientProps {
  subscriptionId: string
  initialData: SubscriptionIncludeOutput
}

export function AccountSubscriptionDetailClient({
  subscriptionId,
  initialData,
}: AccountSubscriptionDetailClientProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const { data: subscription } = useSubscription(subscriptionId, {
    initialData,
  })

  const { data: invoicesData, isLoading: invoicesLoading } =
    useSubscriptionInvoices(
      {
        subscriptionId,
        page: 1,
        limit: 10,
      },
      {
        enabled: activeTab === "invoices",
      }
    )

  const { data: transactionsData, isLoading: transactionsLoading } =
    useSubscriptionTransactions(
      {
        subscriptionId,
        page: 1,
        limit: 10,
      },
      {
        enabled: activeTab === "transactions",
      }
    )

  const { data: historyData, isLoading: historyLoading } =
    useSubscriptionHistory(
      {
        subscriptionId,
        page: 1,
        limit: 10,
      },
      {
        enabled: activeTab === "history",
      }
    )

  if (!subscription) {
    return null
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatPrice = (price: number, currency: string) => {
    return `${price} ${currency}`
  }

  const getStatusColor = (status: SubscriptionStatusInfer) => {
    switch (status) {
      case subscriptionStatusEnum.ACTIVE:
        return "default"
      case subscriptionStatusEnum.ON_TRIAL:
        return "secondary"
      case subscriptionStatusEnum.CANCELLED:
        return "destructive"
      case subscriptionStatusEnum.PAST_DUE:
        return "destructive"
      case subscriptionStatusEnum.EXPIRED:
        return "outline"
      case subscriptionStatusEnum.UNPAID:
        return "destructive"
      case subscriptionStatusEnum.PAUSED:
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {subscription.product.name}
          </h1>
          <p className="text-muted-foreground">
            Subscription details and billing information
          </p>
        </div>
        <Badge variant={getStatusColor(subscription.status)}>
          {subscription.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Information</CardTitle>
          <CardDescription>Details about your subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">
                Product
              </p>
              <p className="text-sm">{subscription.product.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">Price</p>
              <p className="text-sm">
                {formatPrice(subscription.price, subscription.currency)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">
                Interval
              </p>
              <p className="text-sm">{subscription.product.interval}</p>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">
                Status
              </p>
              <p className="text-sm">{subscription.status}</p>
            </div>
            {subscription.renewsAt && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  Renews At
                </p>
                <p className="text-sm">{formatDate(subscription.renewsAt)}</p>
              </div>
            )}
            {subscription.endsAt && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  Ends At
                </p>
                <p className="text-sm">{formatDate(subscription.endsAt)}</p>
              </div>
            )}
            {subscription.trialEndsAt && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  Trial Ends At
                </p>
                <p className="text-sm">
                  {formatDate(subscription.trialEndsAt)}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">
                Subscription ID
              </p>
              <p className="font-mono text-sm text-xs">
                {subscription.subscriptionId}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm font-medium">
                Order ID
              </p>
              <p className="font-mono text-sm text-xs">
                {subscription.orderId}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Subscription summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Product Description</p>
                <p className="text-muted-foreground text-sm">
                  {subscription.product.description ||
                    "No description available"}
                </p>
              </div>
              {subscription.cancelledAt && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Cancelled At</p>
                  <p className="text-muted-foreground text-sm">
                    {formatDate(subscription.cancelledAt)}
                  </p>
                  {subscription.cancelledReason && (
                    <>
                      <p className="text-sm font-medium">Cancellation Reason</p>
                      <p className="text-muted-foreground text-sm">
                        {subscription.cancelledReason}
                      </p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="invoices" className="space-y-4">
          <AccountInvoiceList
            invoices={invoicesData?.invoices ?? []}
            isLoading={invoicesLoading}
          />
        </TabsContent>
        <TabsContent value="transactions" className="space-y-4">
          <AccountTransactionList
            transactions={transactionsData?.transactions ?? []}
            isLoading={transactionsLoading}
          />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <AccountSubscriptionHistoryList
            history={historyData?.history ?? []}
            isLoading={historyLoading}
          />
        </TabsContent>
      </Tabs>

      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link href="/account/subscription">Back to Subscription</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/account/invoices">View Invoices</Link>
        </Button>
      </div>
    </div>
  )
}
