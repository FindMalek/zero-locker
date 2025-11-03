import { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@/orpc/client/server"
import { createContext } from "@/orpc/context"

import { auth } from "@/lib/auth/server"

import { AccountOverviewClient } from "@/components/app/account-overview-client"

export const metadata: Metadata = {
  title: "Account Overview",
}

export default async function AccountOverviewPage() {
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
      limit: 10,
    }),
    serverClient.users.getCurrentUser({}),
  ])

  return (
    <AccountOverviewClient
      initialSubscriptions={subscriptionsResponse}
      initialUser={userResponse}
    />
  )
}
