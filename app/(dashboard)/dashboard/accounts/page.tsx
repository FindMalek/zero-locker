import { Metadata } from "next"
import { createServerClient } from "@/orpc/client/server"
import { createContext } from "@/orpc/context"

import { DashboardAccountsClient } from "@/components/app/dashboard-accounts-client"

export const metadata: Metadata = {
  title: "Accounts",
  description: "Manage your accounts and credentials",
}

async function getInitialData() {
  const context = await createContext()
  const serverClient = createServerClient(context)

  const [credentialsResponse, platformsResponse] = await Promise.all([
    serverClient.credentials.list({
      page: 1,
      limit: 50,
    }),
    serverClient.platforms.list({
      page: 1,
      limit: 100,
    }),
  ])

  return {
    credentials: credentialsResponse,
    platforms: platformsResponse,
  }
}

export default async function AccountsPage() {
  const initialData = await getInitialData()

  return <DashboardAccountsClient initialData={initialData} />
}
