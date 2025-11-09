"use client"

import Link from "next/link"
import { useCurrentUser } from "@/orpc/hooks/use-users"
import type { SubscriptionIncludeOutput } from "@/schemas/subscription"
import { subscriptionStatusEnum } from "@/schemas/subscription"
import { UserPlan } from "@prisma/client"

import { DateFormatter } from "@/lib/date-utils"
import { getPlanInfo } from "@/lib/permissions"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"

const LEMON_SQUEEZY_CUSTOMER_PORTAL =
  "https://app.lemonsqueezy.com/customer-portal"
const LEMON_SQUEEZY_CHECKOUT = "https://app.lemonsqueezy.com/checkout"

interface AccountSubscriptionCurrentPlanProps {
  activeSubscription?: SubscriptionIncludeOutput | null
}

export function AccountSubscriptionCurrentPlan({
  activeSubscription,
}: AccountSubscriptionCurrentPlanProps) {
  const { data: currentUser } = useCurrentUser()
  const userPlan = currentUser?.plan ?? UserPlan.NORMAL
  const isPro = userPlan === UserPlan.PRO
  const isCancelled =
    activeSubscription?.status === subscriptionStatusEnum.CANCELLED

  const currentPlanInfo = getPlanInfo(userPlan)

  return (
    <div className="from-background to-muted/40 space-y-6 rounded-lg border bg-gradient-to-br p-8 md:p-10">
      <div>
        <p className="text-muted-foreground mb-2 text-sm font-medium uppercase tracking-wide">
          Your Current Plan
        </p>
        <h2 className="text-foreground text-4xl font-bold">
          {currentPlanInfo.name}
        </h2>
      </div>
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-muted-foreground mb-4 text-sm">
            {currentPlanInfo.description}
          </p>
          {isPro &&
            activeSubscription &&
            activeSubscription.renewsAt &&
            !isCancelled && (
              <p className="text-muted-foreground text-sm">
                Renews on{" "}
                {DateFormatter.formatLongDate(activeSubscription.renewsAt)}
              </p>
            )}
          {isPro &&
            activeSubscription &&
            isCancelled &&
            activeSubscription.endsAt && (
              <p className="text-muted-foreground text-sm">
                Ends on{" "}
                {DateFormatter.formatLongDate(activeSubscription.endsAt)}
              </p>
            )}
        </div>
        {isPro && activeSubscription ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" asChild className="w-full md:w-auto">
              <a
                href={LEMON_SQUEEZY_CUSTOMER_PORTAL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icons.creditCard className="mr-2 size-4" />
                {isCancelled ? "Resume Subscription" : "Manage Subscription"}
              </a>
            </Button>
            {/* 
            TODO: We need to re-think what this button should do.
            */}
            <Button variant="ghost" asChild className="w-full md:w-auto">
              <Link href="/account/subscription">
                <Icons.fileList className="mr-2 size-4" />
                View Details
              </Link>
            </Button>
          </div>
        ) : (
          <Button asChild className="w-full md:w-auto" size="lg">
            <a
              href={LEMON_SQUEEZY_CHECKOUT}
              target="_blank"
              rel="noopener noreferrer"
            >
              Upgrade Plan <Icons.arrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
