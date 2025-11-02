import { Metadata } from "next"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"

import { auth } from "@/lib/auth/server"
import { createServerClient } from "@/orpc/client/server"
import { createContext } from "@/orpc/context"

import { AccountSubscriptionDetailSkeleton } from "@/components/app/account-subscription-detail-skeleton"
import { AccountSubscriptionDetailClient } from "@/components/app/account-subscription-detail-client"

interface SubscriptionDetailPageProps {
  params: Promise<{ id: string }>
}

async function getSubscriptionData(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return null
  }

  const context = await createContext()
  const serverClient = createServerClient(context)

  try {
    const subscription = await serverClient.subscriptions.get({ id })
    return subscription
  } catch (error) {
    console.error("Failed to get subscription:", error)
    return null
  }
}

export async function generateMetadata({
  params,
}: SubscriptionDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const subscription = await getSubscriptionData(resolvedParams.id)

  if (!subscription) {
    return {
      title: "Subscription Not Found",
    }
  }

  return {
    title: `${subscription.product.name} - Subscription Details`,
    description: `View details, invoices, and transaction history for your ${subscription.product.name} subscription.`,
  }
}

export default async function SubscriptionDetailPage({
  params,
}: SubscriptionDetailPageProps) {
  const resolvedParams = await params

  if (!resolvedParams.id) {
    notFound()
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const data = await getSubscriptionData(resolvedParams.id)

  if (!data) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<AccountSubscriptionDetailSkeleton />}>
        <AccountSubscriptionDetailClient
          subscriptionId={resolvedParams.id}
          initialData={data}
        />
      </Suspense>
    </div>
  )
}

