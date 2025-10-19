"use client"

import { useMemo, useState } from "react"
import { useCredentials } from "@/orpc/hooks/use-credentials"
import { usePlatforms } from "@/orpc/hooks/use-platforms"
import type { ListCredentialsOutput } from "@/schemas/credential"
import type {
  ListPlatformsOutput,
  SortDirection,
  SortField,
  ViewMode,
} from "@/schemas/utils"
import { AccountStatus } from "@prisma/client"

import { DashboardCredentialCardsView } from "@/components/app/dashboard-credential-cards-view"
import { DashboardCredentialCardsViewSkeleton } from "@/components/app/dashboard-credential-cards-view-skeleton"
import { DashboardCredentialGridView } from "@/components/app/dashboard-credential-grid-view"
import { DashboardCredentialGridViewSkeleton } from "@/components/app/dashboard-credential-grid-view-skeleton"
import { DashboardCredentialsHeader } from "@/components/app/dashboard-credentials-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Icons } from "@/components/shared/icons"

interface CredentialsClientProps {
  initialData: {
    credentials: ListCredentialsOutput
    platforms: ListPlatformsOutput
  }
}

export function DashboardCredentialsClient({
  initialData,
}: CredentialsClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilters, setStatusFilters] = useState<AccountStatus[]>([])
  const [platformFilters, setPlatformFilters] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [showArchived, setShowArchived] = useState(false)

  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status as AccountStatus)
        ? prev.filter((s) => s !== status)
        : [...prev, status as AccountStatus]
    )
  }

  const togglePlatformFilter = (platformId: string) => {
    setPlatformFilters((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    )
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setStatusFilters([])
    setPlatformFilters([])
  }

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const queryInput = useMemo(
    () => ({
      page: 1,
      limit: 50,
      ...(searchTerm && { search: searchTerm }),
      filters: {
        ...(statusFilters.length > 0 && { statuses: statusFilters }),
        ...(platformFilters.length > 0 && { platformIds: platformFilters }),
        showArchived,
      },
      ...(sortField &&
        sortDirection && {
          sort: {
            field: sortField,
            direction: sortDirection,
          },
        }),
    }),
    [
      searchTerm,
      statusFilters,
      platformFilters,
      showArchived,
      sortField,
      sortDirection,
    ]
  )

  const { data: credentialsData, isFetching } = useCredentials(queryInput)

  const { data: platformsData } = usePlatforms(
    { page: 1, limit: 100 },
    {
      initialData: initialData.platforms,
    }
  )

  const platforms = useMemo(() => {
    return platformsData?.platforms || []
  }, [platformsData?.platforms])

  const credentials = useMemo(() => {
    return credentialsData?.credentials || []
  }, [credentialsData?.credentials])

  const uniquePlatforms = useMemo(() => {
    const platformMap = new Map()
    platforms.forEach((platform) => {
      if (!platformMap.has(platform.name)) {
        platformMap.set(platform.name, platform)
      }
    })
    return Array.from(platformMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }, [platforms])

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl p-6">
        <DashboardCredentialsHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilters={statusFilters}
          onToggleStatusFilter={toggleStatusFilter}
          platformFilters={platformFilters}
          onTogglePlatformFilter={togglePlatformFilter}
          platforms={uniquePlatforms}
          onClearFilters={clearAllFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          showArchived={showArchived}
          onShowArchivedChange={setShowArchived}
        />

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {credentialsData?.total || 0}{" "}
            {credentialsData?.total === 1 ? "credential" : "credentials"}
          </p>
          {isFetching && (
            <div className="text-secondary-foreground flex items-center gap-1 text-xs">
              <Icons.spinner className="size-3 animate-spin" />
              <span>Loading...</span>
            </div>
          )}
        </div>

        {isFetching && !credentials.length ? (
          viewMode === "cards" ? (
            <DashboardCredentialCardsViewSkeleton />
          ) : (
            <DashboardCredentialGridViewSkeleton />
          )
        ) : credentials.length === 0 ? (
          <EmptyState
            title="No credentials found"
            description="Try adjusting your search or filter criteria"
            actionLabel="Clear filters"
            onAction={clearAllFilters}
          />
        ) : (
          <>
            {viewMode === "cards" ? (
              <DashboardCredentialCardsView
                credentials={credentials}
                platforms={platforms}
              />
            ) : (
              <DashboardCredentialGridView
                credentials={credentials}
                platforms={platforms}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
