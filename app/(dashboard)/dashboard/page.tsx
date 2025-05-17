import { Metadata } from "next"
import { RecentItem, RecentItemTypeEnum } from "@/schemas/utils"

import { MAX_RECENT_ITEMS } from "@/config/consts"
import { mapItem } from "@/lib/utils"

import { OverviewStats } from "@/components/app/dashboard-overview-stats"
import { DashboardRecentActivity } from "@/components/app/dashboard-recent-activity"

import { listCards } from "@/actions/card"
import { listCredentials } from "@/actions/credential"
import { listSecrets } from "@/actions/secret"

async function getRecentItems(): Promise<RecentItem[]> {
  const [usersResponse, cardsResponse, secretsResponse] = await Promise.all([
    listCredentials(1, MAX_RECENT_ITEMS),
    listCards(1, MAX_RECENT_ITEMS),
    listSecrets(1, MAX_RECENT_ITEMS),
  ])

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

async function getStats() {
  const [credentialsData, cardsData, secretsData] = await Promise.all([
    listCredentials(1, 1),
    listCards(1, 1),
    listSecrets(1, 1),
  ])

  return {
    credentials: credentialsData.credentials?.length ?? 0,
    cards: cardsData.cards?.length ?? 0,
    secrets: secretsData.secrets?.length ?? 0,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()
  const recentItems = await getRecentItems()

  return (
    <div className="space-y-6">
      <OverviewStats stats={stats} />
      <DashboardRecentActivity recentItems={recentItems} />
    </div>
  )
}
