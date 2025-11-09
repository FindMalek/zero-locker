"use client"

import { useEffect } from "react"
import { useSubscriptions } from "@/orpc/hooks/use-subscriptions"
import { useCurrentUser } from "@/orpc/hooks/use-users"
import type { ListSubscriptionsOutput } from "@/schemas/subscription"
import { subscriptionStatusEnum } from "@/schemas/subscription"
import { UserPlan } from "@prisma/client"
import { useQueryClient } from "@tanstack/react-query"

import { AccountCurrentPlanCard } from "@/components/app/account-current-plan-card"
import { AccountPageHeader } from "@/components/app/account-page-header"
import { AccountPaymentMethodsCard } from "@/components/app/account-payment-methods-card"
import { AccountPlanComparisonCard } from "@/components/app/account-plan-comparison-card"

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
    (sub) =>
      sub.status === subscriptionStatusEnum.ACTIVE ||
      sub.status === subscriptionStatusEnum.ON_TRIAL
  )

  const userPlan = currentUser?.plan ?? UserPlan.NORMAL
  const isPro = userPlan === UserPlan.PRO

  return (
    <div className="space-y-8">
      <AccountPageHeader
        title="Subscription"
        description="Manage your subscription plan and billing"
      />

      <AccountCurrentPlanCard activeSubscription={activeSubscription} />

      {isPro && <AccountPaymentMethodsCard />}

      <AccountPlanComparisonCard />
    </div>
  )
}
