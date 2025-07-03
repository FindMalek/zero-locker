"use client"

import { useEffect } from "react"
import { useCards, useCredentials, useSecrets } from "@/orpc/hooks"
import { cardKeys } from "@/orpc/hooks/use-cards"
import { credentialKeys } from "@/orpc/hooks/use-credentials"
import { secretKeys } from "@/orpc/hooks/use-secrets"
import type { ListCardsOutput } from "@/schemas/card/dto"
import type { ListCredentialsOutput } from "@/schemas/credential/dto"
import type { ListSecretsOutput } from "@/schemas/secrets/dto"
import type { RecentItem } from "@/schemas/utils"
import { RecentItemTypeEnum } from "@/schemas/utils"
import { useQueryClient } from "@tanstack/react-query"

import { MAX_RECENT_ITEMS } from "@/config/consts"
import { mapItem } from "@/lib/utils"

import { OverviewStats } from "@/components/app/dashboard-overview-stats"
import { DashboardRecentActivity } from "@/components/app/dashboard-recent-activity"

interface DashboardClientProps {
  initialCredentials: ListCredentialsOutput
  initialCards: ListCardsOutput
  initialSecrets: ListSecretsOutput
}

function getRecentItems(
  credentialsData: ListCredentialsOutput,
  cardsData: ListCardsOutput,
  secretsData: ListSecretsOutput
): RecentItem[] {
  const recentCredentials: RecentItem[] = (
    credentialsData?.credentials ?? []
  ).map((user) => ({
    ...mapItem(user, RecentItemTypeEnum.CREDENTIAL),
    type: RecentItemTypeEnum.CREDENTIAL,
    entity: user,
  }))

  const recentCards: RecentItem[] = (cardsData?.cards ?? []).map((card) => ({
    ...mapItem(card, RecentItemTypeEnum.CARD),
    type: RecentItemTypeEnum.CARD,
    entity: card,
  }))

  const recentSecrets: RecentItem[] = (secretsData?.secrets ?? []).map(
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

function getStats(
  credentialsData: ListCredentialsOutput,
  cardsData: ListCardsOutput,
  secretsData: ListSecretsOutput
) {
  return {
    credentials: credentialsData?.credentials?.length ?? 0,
    cards: cardsData?.cards?.length ?? 0,
    secrets: secretsData?.secrets?.length ?? 0,
  }
}

export function DashboardClient({
  initialCredentials,
  initialCards,
  initialSecrets,
}: DashboardClientProps) {
  const queryClient = useQueryClient()

  const credentialsQuery = useCredentials({ page: 1, limit: MAX_RECENT_ITEMS })
  const cardsQuery = useCards({ page: 1, limit: MAX_RECENT_ITEMS })
  const secretsQuery = useSecrets({ page: 1, limit: MAX_RECENT_ITEMS })

  useEffect(() => {
    queryClient.setQueryData(
      credentialKeys.list({ page: 1, limit: MAX_RECENT_ITEMS }),
      initialCredentials
    )
    queryClient.setQueryData(
      cardKeys.list({ page: 1, limit: MAX_RECENT_ITEMS }),
      initialCards
    )
    queryClient.setQueryData(
      secretKeys.list({ page: 1, limit: MAX_RECENT_ITEMS }),
      initialSecrets
    )
  }, [queryClient, initialCredentials, initialCards, initialSecrets])

  const currentCredentials = credentialsQuery.data || initialCredentials
  const currentCards = cardsQuery.data || initialCards
  const currentSecrets = secretsQuery.data || initialSecrets

  const stats = getStats(currentCredentials, currentCards, currentSecrets)
  const recentItems = getRecentItems(
    currentCredentials,
    currentCards,
    currentSecrets
  )

  return (
    <div className="space-y-6">
      <OverviewStats stats={stats} />
      <DashboardRecentActivity recentItems={recentItems} />
    </div>
  )
}
