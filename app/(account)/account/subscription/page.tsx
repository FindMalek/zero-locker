import { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@/orpc/client/server"
import { createContext } from "@/orpc/context"

import { auth } from "@/lib/auth/server"

import { AccountSubscriptionClient } from "@/components/app/account-subscription-client"

export const metadata: Metadata = {
  title: "Subscription",
}

export default async function SubscriptionPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const context = await createContext()
  const serverClient = createServerClient(context)

  const subscriptionsResponse = await serverClient.subscriptions.list({
    page: 1,
    limit: 100,
  })

  return (
    <AccountSubscriptionClient initialSubscriptions={subscriptionsResponse} />
  )
}
