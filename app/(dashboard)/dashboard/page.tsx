import { Metadata } from "next"
import { RecentItem, RecentItemTypeEnum } from "@/schemas/utils"

import { mapItem } from "@/lib/utils"

import { OverviewStats } from "@/components/app/dashboard-overview-stats"
import { DashboardRecentActivity } from "@/components/app/dashboard-recent-activity"

import { listCards } from "@/actions/card"
import { listSecrets } from "@/actions/secret"
import { listUsers } from "@/actions/user"

async function getRecentItems(): Promise<RecentItem[]> {
  const [usersResponse, cardsResponse, secretsResponse] = await Promise.all([
    listUsers(1, 5),
    listCards(1, 5),
    listSecrets(1, 5),
  ])

  const recentUsers: RecentItem[] = (usersResponse.users ?? []).map((user) => ({
    ...mapItem(user),
    type: RecentItemTypeEnum.CREDENTIAL,
    entity: {
      username: user.email,
    },
  }))

  const recentCards: RecentItem[] = (cardsResponse.cards ?? []).map((card) => ({
    ...mapItem(card),
    type: RecentItemTypeEnum.CARD,
    entity: {
      type: card.type,
      number: card.number,
    },
  }))

  const recentSecrets: RecentItem[] = (secretsResponse.secrets ?? []).map(
    (secret) => ({
      ...mapItem(secret),
      type: RecentItemTypeEnum.SECRET,
      entity: {
        name: secret.name,
        value: secret.value,
      },
    })
  )

  const allItems = [...recentUsers, ...recentCards, ...recentSecrets]
  allItems.sort(
    (a, b) =>
      new Date(b.lastActivityAt).getTime() -
      new Date(a.lastActivityAt).getTime()
  )

  return allItems.slice(0, 5)
}

export const metadata: Metadata = {
  title: "Dashboard Overview",
}

async function getStats() {
  const [usersData, cardsData, secretsData] = await Promise.all([
    listUsers(1, 1),
    listCards(1, 1),
    listSecrets(1, 1),
  ])

  return {
    accounts: usersData.users?.length ?? 0,
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
