"use client"

import Link from "next/link"
import {
  subscriptionStatusEnum,
  type SubscriptionStatusInfer,
} from "@/schemas/subscription"
import type { SubscriptionIncludeOutput } from "@/schemas/subscription"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface AccountSubscriptionCardProps {
  subscription: SubscriptionIncludeOutput
}

export function AccountSubscriptionCard({
  subscription,
}: AccountSubscriptionCardProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString()
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{subscription.product.name}</CardTitle>
          <Badge variant={getStatusColor(subscription.status)}>
            {subscription.status}
          </Badge>
        </div>
        <CardDescription>{subscription.product.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Price</p>
            <p className="font-medium">
              {formatPrice(subscription.price, subscription.currency)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Interval</p>
            <p className="font-medium">{subscription.product.interval}</p>
          </div>
          {subscription.renewsAt && (
            <div>
              <p className="text-muted-foreground">Renews At</p>
              <p className="font-medium">{formatDate(subscription.renewsAt)}</p>
            </div>
          )}
          {subscription.endsAt && (
            <div>
              <p className="text-muted-foreground">Ends At</p>
              <p className="font-medium">{formatDate(subscription.endsAt)}</p>
            </div>
          )}
        </div>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/account/subscription`}>Manage Subscription</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
