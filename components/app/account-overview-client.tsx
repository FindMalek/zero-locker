"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useSubscriptions } from "@/orpc/hooks/use-subscriptions"
import { subscriptionStatusEnum } from "@/schemas/subscription"
import type { ListSubscriptionsOutput } from "@/schemas/subscription"
import type { UserSimpleOutput } from "@/schemas/user/user"
import { useQueryClient } from "@tanstack/react-query"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface AccountOverviewClientProps {
  initialSubscriptions: ListSubscriptionsOutput
  initialUser: UserSimpleOutput
}

export function AccountOverviewClient({
  initialSubscriptions,
  initialUser,
}: AccountOverviewClientProps) {
  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.setQueryData(
      ["subscriptions", "list", { page: 1, limit: 10 }],
      initialSubscriptions
    )
  }, [initialSubscriptions, queryClient])

  const { data: subscriptionsData } = useSubscriptions(
    { page: 1, limit: 10 },
    { initialData: initialSubscriptions }
  )

  const activeSubscription = subscriptionsData?.subscriptions.find(
    (sub) =>
      sub.status === subscriptionStatusEnum.ACTIVE ||
      sub.status === subscriptionStatusEnum.ON_TRIAL
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Overview</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Email</span>
              <span className="text-sm font-medium">{initialUser.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Name</span>
              <span className="text-sm font-medium">{initialUser.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Plan</span>
              <span className="text-sm font-medium">{initialUser.plan}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Your active subscription</CardDescription>
          </CardHeader>
          <CardContent>
            {activeSubscription ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Product</span>
                  <span className="text-sm font-medium">
                    {activeSubscription.product.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Price</span>
                  <span className="text-sm font-medium">
                    {activeSubscription.price} {activeSubscription.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Status</span>
                  <span className="text-sm font-medium">
                    {activeSubscription.status}
                  </span>
                </div>
                {activeSubscription.renewsAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Next Billing
                    </span>
                    <span className="text-sm font-medium">
                      {new Date(
                        activeSubscription.renewsAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No active subscription
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button asChild>
          <Link href="/account/subscriptions">
            <Icons.fileList className="mr-2 size-4" />
            View All Subscriptions
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/account/billing">
            <Icons.creditCard className="mr-2 size-4" />
            Billing Settings
          </Link>
        </Button>
      </div>
    </div>
  )
}
