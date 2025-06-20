import { Metadata } from "next"
import { createServerClient } from "@/orpc/client/server"
import { createContext } from "@/orpc/context"
import type { ListCardsOutput } from "@/schemas/card/dto"
import type { ListCredentialsOutput } from "@/schemas/credential/dto"
import type { ListSecretsOutput } from "@/schemas/secrets/dto"
import { RecentItem, RecentItemTypeEnum } from "@/schemas/utils"

import { MAX_RECENT_ITEMS } from "@/config/consts"
import { mapItem } from "@/lib/utils"

import { OverviewStats } from "@/components/app/dashboard-overview-stats"
import { DashboardRecentActivity } from "@/components/app/dashboard-recent-activity"

async function getRecentItems(
  usersResponse: ListCredentialsOutput,
  cardsResponse: ListCardsOutput,
  secretsResponse: ListSecretsOutput
): Promise<RecentItem[]> {
  const recentCredentials: RecentItem[] = (usersResponse.credentials ?? []).map(
    (user) => ({
      ...mapItem(user, RecentItemTypeEnum.CREDENTIAL),
      type: RecentItemTypeEnum.CREDENTIAL,
      entity: user,
    })
  )

  const recentCards: RecentItem[] = (cardsResponse.cards ?? []).map((card) => ({
    ...mapItem(card, RecentItemTypeEnum.CARD),
    type: RecentItemTypeEnum.CARD,
    entity: card,
  }))

  const recentSecrets: RecentItem[] = (secretsResponse.secrets ?? []).map(
    (secret) => ({
      ...mapItem(secret, RecentItemTypeEnum.SECRET),
      type: RecentItemTypeEnum.SECRET,
      entity: secret,
    })
  )

  const allItems = [
    ...recentCredentials,
    ...recentCards,
    ...recentSecrets,
  ].sort((a, b) => {
    return (
      new Date(b.lastActivityAt).getTime() -
      new Date(a.lastActivityAt).getTime()
    )
  })

  return allItems.slice(0, MAX_RECENT_ITEMS)
}

export const metadata: Metadata = {
  title: "Dashboard Overview",
}

async function getStats(
  credentialsData: ListCredentialsOutput,
  cardsData: ListCardsOutput,
  secretsData: ListSecretsOutput
) {
  return {
    credentials: credentialsData.credentials?.length ?? 0,
    cards: cardsData.cards?.length ?? 0,
    secrets: secretsData.secrets?.length ?? 0,
  }
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

  const stats = await getStats(
    credentialsResponse,
    cardsResponse,
    secretsResponse
  )
  const recentItems = await getRecentItems(
    credentialsResponse,
    cardsResponse,
    secretsResponse
  )

  return (
    <div className="space-y-6">
      <OverviewStats stats={stats} />
      <DashboardRecentActivity recentItems={recentItems} />
    </div>
  )
}
