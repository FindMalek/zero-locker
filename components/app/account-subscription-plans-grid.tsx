"use client"

import { useCurrentUser } from "@/orpc/hooks/use-users"
import { UserPlan } from "@prisma/client"

import { getAllPlansInfo, getPlanInfo } from "@/lib/permissions"

import { AccountSubscriptionPlanCard } from "@/components/app/account-subscription-plan-card"

export function AccountSubscriptionPlansGrid() {
  const { data: currentUser } = useCurrentUser()
  const userPlan = currentUser?.plan ?? UserPlan.NORMAL

  const plans = getAllPlansInfo()
  const currentPlanId = getPlanInfo(userPlan).id

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <AccountSubscriptionPlanCard
            key={plan.id}
            plan={plan}
            isCurrent={plan.id === currentPlanId}
          />
        ))}
      </div>
    </div>
  )
}
