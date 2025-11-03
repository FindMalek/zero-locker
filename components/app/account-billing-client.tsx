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
import { AccountSubscriptionCard } from "@/components/app/account-subscription-card"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AccountBillingClientProps {
  initialSubscriptions: ListSubscriptionsOutput
}

export function AccountBillingClient({
  initialSubscriptions,
}: AccountBillingClientProps) {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing Settings</h1>
        <p className="text-muted-foreground">
          Manage your payment methods, invoices, and subscription billing
        </p>
      </div>

      <Tabs defaultValue="subscriptions" className="w-full">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">All Invoices</TabsTrigger>
        </TabsList>
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Subscriptions</CardTitle>
              <CardDescription>
                Manage and view all your active and past subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">
                    No subscriptions found
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/account/subscriptions">
                      View Subscriptions
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {subscriptions.map((subscription) => (
                    <AccountSubscriptionCard
                      key={subscription.id}
                      subscription={subscription}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payment-methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods for subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <Icons.creditCard className="text-muted-foreground mb-4 size-12" />
                <p className="text-muted-foreground mb-4">
                  Payment methods are managed through LemonSqueezy
                </p>
                <Button variant="outline" asChild>
                  <a
                    href="https://app.lemonsqueezy.com/customer-portal"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Manage Payment Methods
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>
                View and download all your invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allInvoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">No invoices found</p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Invoices will appear here once you have active subscriptions
                  </p>
                </div>
              ) : (
                <AccountInvoiceList
                  invoices={allInvoices}
                  isLoading={isLoadingInvoices}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <Link href="/account">Back to Account</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/account/subscriptions">View All Subscriptions</Link>
        </Button>
      </div>
    </div>
  )
}
