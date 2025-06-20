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



/**
 * Aggregates and returns the most recent credentials, cards, and secrets as unified recent activity items.
 *
 * Maps each credential, card, and secret to a standardized `RecentItem` format, tags them by type, merges them, sorts by most recent activity, and limits the result to the maximum allowed recent items.
 *
 * @param usersResponse - The response containing credential data
 * @param cardsResponse - The response containing card data
 * @param secretsResponse - The response containing secret data
 * @returns An array of the most recent activity items across all types
 */
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

/**
 * Computes the total counts of credentials, cards, and secrets from the provided data.
 *
 * @param credentialsData - The response data containing the list of credentials
 * @param cardsData - The response data containing the list of cards
 * @param secretsData - The response data containing the list of secrets
 * @returns An object with the counts of credentials, cards, and secrets
 */
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

/**
 * Renders the dashboard overview page with recent activity and statistics for credentials, cards, and secrets.
 *
 * Fetches recent credentials, cards, and secrets, computes their counts, and displays them using overview and recent activity components.
 *
 * @returns The dashboard page JSX element
 */
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
