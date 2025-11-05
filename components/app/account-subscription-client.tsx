"use client"

import { useEffect } from "react"
import Link from "next/link"
import {
  useAllSubscriptionInvoices,
  useSubscriptions,
} from "@/orpc/hooks/use-subscriptions"
import { useCurrentUser } from "@/orpc/hooks/use-users"
import type { ListSubscriptionsOutput } from "@/schemas/subscription"
import { UserPlan } from "@prisma/client"
import { useQueryClient } from "@tanstack/react-query"

import { AccountInvoiceList } from "@/components/app/account-invoice-list"
import { AccountPageHeader } from "@/components/app/account-page-header"
import { Icons } from "@/components/shared/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface AccountSubscriptionClientProps {
  initialSubscriptions: ListSubscriptionsOutput
}

export function AccountSubscriptionClient({
  initialSubscriptions,
}: AccountSubscriptionClientProps) {
  const queryClient = useQueryClient()
  const { data: currentUser } = useCurrentUser()

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
  const activeSubscription = subscriptions.find(
    (sub) => sub.status === "ACTIVE" || sub.status === "ON_TRIAL"
  )

  // Fetch invoices for all subscriptions in parallel
  const { invoices: allInvoices, isLoading: isLoadingInvoices } =
    useAllSubscriptionInvoices(
      subscriptions.map((subscription) => subscription.id),
      { page: 1, limit: 5 } // Only show recent 5 invoices
    )

  const userPlan = currentUser?.plan ?? UserPlan.NORMAL
  const isPro = userPlan === UserPlan.PRO

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      <AccountPageHeader
        title="Subscription"
        description="Manage your subscription plan and billing"
      />

      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                {isPro
                  ? "You are currently on the Pro plan"
                  : "You are currently on the Free plan"}
              </CardDescription>
            </div>
            <Badge
              variant={isPro ? "default" : "secondary"}
              className="text-sm"
            >
              {isPro ? "PRO" : "FREE"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isPro && activeSubscription ? (
            <>
              <div className="grid gap-4 text-sm md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Plan</p>
                  <p className="font-medium">
                    {activeSubscription.product.name}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium">
                    {formatPrice(
                      Number(activeSubscription.price),
                      activeSubscription.currency
                    )}
                    /{activeSubscription.product.interval.toLowerCase()}
                  </p>
                </div>
                {activeSubscription.renewsAt && (
                  <div>
                    <p className="text-muted-foreground">Next Billing Date</p>
                    <p className="font-medium">
                      {formatDate(activeSubscription.renewsAt)}
                    </p>
                  </div>
                )}
                {activeSubscription.endsAt && (
                  <div>
                    <p className="text-muted-foreground">Ends At</p>
                    <p className="font-medium">
                      {formatDate(activeSubscription.endsAt)}
                    </p>
                  </div>
                )}
              </div>
              <Separator />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <a
                    href="https://app.lemonsqueezy.com/customer-portal"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icons.creditCard className="mr-2 size-4" />
                    Manage Subscription
                  </a>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  Upgrade to Pro to unlock unlimited containers and all premium
                  features.
                </p>
              </div>
              <Button asChild className="w-full sm:w-auto">
                {/* TODO: Replace with actual Lemon Squeezy checkout link */}
                <a
                  href="https://app.lemonsqueezy.com/checkout"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Upgrade to Pro
                </a>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      {isPro && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>
              Manage your payment methods through Lemon Squeezy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <a
                href="https://app.lemonsqueezy.com/customer-portal"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icons.creditCard className="mr-2 size-4" />
                Manage Payment Methods
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Invoices */}
      {isPro && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>
                  Your most recent invoices and payment history
                </CardDescription>
              </div>
              {allInvoices.length > 0 && (
                <Button variant="ghost" asChild>
                  <Link href="/account/invoices">View All</Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {allInvoices.length === 0 && !isLoadingInvoices ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Icons.post className="text-muted-foreground mb-2 size-8" />
                <p className="text-muted-foreground text-sm">
                  No invoices found
                </p>
              </div>
            ) : (
              <AccountInvoiceList
                invoices={allInvoices.slice(0, 5)}
                isLoading={isLoadingInvoices}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
          <CardDescription>Compare Free and Pro plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Free Plan</h3>
                <Badge variant="secondary">CURRENT</Badge>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Icons.check className="text-muted-foreground size-4" />
                  <span>3 default containers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icons.check className="text-muted-foreground size-4" />
                  <span>Basic features</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    No custom containers
                  </span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Pro Plan</h3>
                {isPro && <Badge variant="default">CURRENT</Badge>}
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Icons.check className="size-4 text-green-600" />
                  <span>Unlimited containers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icons.check className="size-4 text-green-600" />
                  <span>All premium features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icons.check className="size-4 text-green-600" />
                  <span>Priority support</span>
                </li>
              </ul>
              {!isPro && (
                <Button asChild className="mt-4 w-full">
                  {/* TODO: Replace with actual Lemon Squeezy checkout link */}
                  <a
                    href="https://app.lemonsqueezy.com/checkout"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Upgrade to Pro
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href="/account">Back to Account</Link>
        </Button>
      </div>
    </div>
  )
}
