"use client"

import { useState } from "react"
import { useSubscriptions } from "@/orpc/hooks/use-subscriptions"
import type { ListSubscriptionsOutput, SubscriptionStatusInfer } from "@/schemas/subscription"
import { subscriptionStatusEnum } from "@/schemas/subscription/subscription/enums"

import { AccountSubscriptionCard } from "@/components/app/account-subscription-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface AccountSubscriptionsListClientProps {
  initialSubscriptions: ListSubscriptionsOutput
}

export function AccountSubscriptionsListClient({
  initialSubscriptions,
}: AccountSubscriptionsListClientProps) {
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatusInfer | undefined>()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useSubscriptions(
    {
      page,
      limit: 20,
      status: statusFilter,
    },
    {
      initialData: page === 1 && !statusFilter ? initialSubscriptions : undefined,
    }
  )

  const subscriptions = data?.subscriptions ?? []
  const hasMore = data?.hasMore ?? false

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your subscriptions and view billing history
          </p>
        </div>
        <Select
          value={statusFilter ?? "all"}
          onValueChange={(value) => {
            setStatusFilter(value === "all" ? undefined : (value as SubscriptionStatusInfer))
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.values(subscriptionStatusEnum).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && page === 1 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="space-y-4">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No subscriptions found</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map((subscription) => (
              <AccountSubscriptionCard
                key={subscription.id}
                subscription={subscription}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

