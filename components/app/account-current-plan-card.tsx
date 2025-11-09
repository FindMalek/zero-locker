"use client"

import Link from "next/link"
import { useCurrentUser } from "@/orpc/hooks/use-users"
import type { SubscriptionIncludeOutput } from "@/schemas/subscription"
import { subscriptionStatusEnum } from "@/schemas/subscription"
import { UserPlan } from "@prisma/client"

import { DateFormatter } from "@/lib/date-utils"

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

interface AccountCurrentPlanCardProps {
  activeSubscription?: SubscriptionIncludeOutput | null
}

const LEMON_SQUEEZY_CUSTOMER_PORTAL =
  "https://app.lemonsqueezy.com/customer-portal"
const LEMON_SQUEEZY_CHECKOUT = "https://app.lemonsqueezy.com/checkout"

export function AccountCurrentPlanCard({
  activeSubscription,
}: AccountCurrentPlanCardProps) {
  const { data: currentUser } = useCurrentUser()
  const userPlan = currentUser?.plan ?? UserPlan.NORMAL
  const isPro = userPlan === UserPlan.PRO
  const isCancelled =
    activeSubscription?.status === subscriptionStatusEnum.CANCELLED

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Current Plan</CardTitle>
            <CardDescription className="text-sm">
              {isPro ? "Pro plan" : "Free plan"}
            </CardDescription>
          </div>
          <Badge variant={isPro ? "default" : "secondary"} className="text-xs">
            {isPro ? "PRO" : "FREE"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPro && activeSubscription ? (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="font-semibold">
                  {formatPrice(
                    Number(activeSubscription.price),
                    activeSubscription.currency
                  )}
                  <span className="text-muted-foreground font-normal">
                    /{activeSubscription.product.interval.toLowerCase()}
                  </span>
                </span>
              </div>
              {activeSubscription.renewsAt && !isCancelled && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next billing</span>
                  <span className="font-medium">
                    {DateFormatter.formatLongDate(activeSubscription.renewsAt)}
                  </span>
                </div>
              )}
              {activeSubscription.endsAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isCancelled ? "Ends" : "Expires"}
                  </span>
                  <span className="font-medium">
                    {DateFormatter.formatLongDate(activeSubscription.endsAt)}
                  </span>
                </div>
              )}
            </div>
            {isCancelled && (
              <p className="text-muted-foreground text-xs">
                Your subscription will remain active until the end of the
                billing period.
              </p>
            )}
            <div className="flex flex-col gap-2">
              <Button variant="outline" asChild className="w-full">
                <a
                  href={LEMON_SQUEEZY_CUSTOMER_PORTAL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icons.creditCard className="mr-2 size-4" />
                  {isCancelled ? "Resume Subscription" : "Manage Subscription"}
                </a>
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/account/subscription">
                  <Icons.fileList className="mr-2 size-4" />
                  View Details
                </Link>
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Cancel, resume, or update your subscription through Lemon Squeezy
              customer portal.
            </p>
          </>
        ) : (
          <>
            <p className="text-muted-foreground text-sm">
              Upgrade to Pro to unlock unlimited containers and all premium
              features.
            </p>
            <Button asChild className="w-full">
              <a
                href={LEMON_SQUEEZY_CHECKOUT}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icons.rocket className="mr-2 size-4" />
                Upgrade to Pro
              </a>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
