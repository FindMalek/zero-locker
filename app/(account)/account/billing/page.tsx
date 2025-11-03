import { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@/orpc/client/server"
import { createContext } from "@/orpc/context"

import { auth } from "@/lib/auth/server"

import { AccountBillingClient } from "@/components/app/account-billing-client"

export const metadata: Metadata = {
  title: "Billing Settings",
}

export default async function BillingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const context = await createContext()
  const serverClient = createServerClient(context)

  const [subscriptionsResponse, userResponse] = await Promise.all([
    serverClient.subscriptions.list({
      page: 1,
      limit: 100,
    }),
    serverClient.users.getCurrentUser({}),
  ])

  return (
    <AccountBillingClient
      initialSubscriptions={subscriptionsResponse}
      initialUser={userResponse}
    />
  )
}
