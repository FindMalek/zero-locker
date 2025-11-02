"use client"

import { subscriptionStatusEnum, type SubscriptionStatusInfer } from "@/schemas/subscription"
import type { SubscriptionHistorySimpleOutput } from "@/schemas/subscription"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface AccountSubscriptionHistoryListProps {
  history: SubscriptionHistorySimpleOutput[]
  isLoading: boolean
}

export function AccountSubscriptionHistoryList({
  history,
  isLoading,
}: AccountSubscriptionHistoryListProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (price: number | null, currency: string) => {
    if (price === null) return "N/A"
    return `${price} ${currency}`
  }

  const getStatusColor = (status: SubscriptionStatusInfer | null) => {
    if (!status) return "outline"
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

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No history found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((entry) => (
        <Card key={entry.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Status Change
              </CardTitle>
              <div className="flex gap-2">
                {entry.previousStatus && (
                  <Badge variant="outline">{entry.previousStatus}</Badge>
                )}
                <span className="text-muted-foreground">→</span>
                <Badge variant={getStatusColor(entry.newStatus)}>
                  {entry.newStatus}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <p className="text-muted-foreground">Changed At</p>
                <p className="font-medium">{formatDate(entry.changedAt)}</p>
              </div>
              {entry.changedBy && (
                <div>
                  <p className="text-muted-foreground">Changed By</p>
                  <p className="font-medium">{entry.changedBy}</p>
                </div>
              )}
              {(entry.previousPrice !== null || entry.newPrice !== null) && (
                <>
                  {entry.previousPrice !== null && (
                    <div>
                      <p className="text-muted-foreground">Previous Price</p>
                      <p className="font-medium">${entry.previousPrice}</p>
                    </div>
                  )}
                  {entry.newPrice !== null && (
                    <div>
                      <p className="text-muted-foreground">New Price</p>
                      <p className="font-medium">${entry.newPrice}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            {entry.reason && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">Reason</p>
                <p className="text-sm">{entry.reason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

