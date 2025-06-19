import { Metadata } from "next"
import type { ListCardsOutput } from "@/schemas/card/dto"
import type { ListCredentialsOutput } from "@/schemas/credential/dto"
import type { ListSecretsOutput } from "@/schemas/secrets/dto"
import { RecentItem, RecentItemTypeEnum } from "@/schemas/utils"

import { MAX_RECENT_ITEMS } from "@/config/consts"
import { mapItem } from "@/lib/utils"
// TODO: Import proper session handling when implemented

import { OverviewStats } from "@/components/app/dashboard-overview-stats"
import { DashboardRecentActivity } from "@/components/app/dashboard-recent-activity"
// TODO: Import when implementing proper authentication
// import { createServerClient } from "@/orpc/client/server"

type CardsResponse = ListCardsOutput
type SecretsResponse = ListSecretsOutput
type CredentialsResponse = ListCredentialsOutput

async function getRecentItems(
  usersResponse: CredentialsResponse,
  cardsResponse: CardsResponse,
  secretsResponse: SecretsResponse
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
  credentialsData: CredentialsResponse,
  cardsData: CardsResponse,
  secretsData: SecretsResponse
) {
  return {
    credentials: credentialsData.credentials?.length ?? 0,
    cards: cardsData.cards?.length ?? 0,
    secrets: secretsData.secrets?.length ?? 0,
  }
}

export default async function DashboardPage() {
  // For now, we'll use placeholder context until we implement proper session handling
  // TODO: Implement proper session extraction from headers/cookies
  // const serverClient = createServerClient({
  //   session: null,
  //   user: null,
  // })

  // Since we need authentication for these endpoints, we'll return empty data for now
  // TODO: Implement proper authentication context passing
  const credentialsResponse: CredentialsResponse = {
    credentials: [],
    total: 0,
    hasMore: false,
    page: 1,
    limit: MAX_RECENT_ITEMS,
  }
  const cardsResponse: CardsResponse = {
    cards: [],
    total: 0,
    hasMore: false,
    page: 1,
    limit: MAX_RECENT_ITEMS,
  }
  const secretsResponse: SecretsResponse = {
    secrets: [],
    total: 0,
    hasMore: false,
    page: 1,
    limit: MAX_RECENT_ITEMS,
  }

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
