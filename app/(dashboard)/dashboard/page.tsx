import { Metadata } from "next"
import { createServerClient } from "@/orpc/client/server"
import { createContext } from "@/orpc/context"

import { MAX_RECENT_ITEMS } from "@/config/consts"

import { DashboardClient } from "@/components/app/dashboard-client"

export const metadata: Metadata = {
  title: "Dashboard Overview",
}

export default async function DashboardPage() {
  const context = await createContext()
  const serverClient = createServerClient(context)

  const [credentialsResponse, cardsResponse, secretsResponse] =
    await Promise.all([
      serverClient.credentials.list({
        page: 1,
        limit: MAX_RECENT_ITEMS,
      }),
      serverClient.cards.list({
        page: 1,
        limit: MAX_RECENT_ITEMS,
      }),
      serverClient.secrets.list({
        page: 1,
        limit: MAX_RECENT_ITEMS,
      }),
    ])

  return (
    <DashboardClient
      initialCredentials={credentialsResponse}
      initialCards={cardsResponse}
      initialSecrets={secretsResponse}
    />
  )
}
