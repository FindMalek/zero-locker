"use client"

import { useEffect } from "react"
import { useSubscriptions } from "@/orpc/hooks/use-subscriptions"
import type { ListSubscriptionsOutput } from "@/schemas/subscription"
import { subscriptionStatusEnum } from "@/schemas/subscription"
import { useQueryClient } from "@tanstack/react-query"

import { AccountPageHeader } from "@/components/app/account-page-header"
import { AccountPaymentMethodsCard } from "@/components/app/account-payment-methods-card"
import { AccountSubscriptionCurrentPlan } from "@/components/app/account-subscription-current-plan"
import { AccountSubscriptionPlansGrid } from "@/components/app/account-subscription-plans-grid"

interface AccountSubscriptionClientProps {
  initialSubscriptions: ListSubscriptionsOutput
}

export function AccountSubscriptionClient({
  initialSubscriptions,
}: AccountSubscriptionClientProps) {
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
  const activeSubscription = subscriptions.find(
    (sub) =>
      sub.status === subscriptionStatusEnum.ACTIVE ||
      sub.status === subscriptionStatusEnum.ON_TRIAL
  )

  return (
    <div className="space-y-16 pb-12">
      <AccountPageHeader
        title="Plans & Billing"
        description="Manage your subscription and choose the perfect plan for your needs"
      />

      <AccountSubscriptionCurrentPlan activeSubscription={activeSubscription} />

      <AccountSubscriptionPlansGrid />

      {activeSubscription && <AccountPaymentMethodsCard />}
    </div>
  )
}
