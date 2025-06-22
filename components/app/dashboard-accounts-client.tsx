"use client"

import { useMemo, useState } from "react"
import { useCredentials } from "@/orpc/hooks/use-credentials"
import { usePlatforms } from "@/orpc/hooks/use-platforms"
import type { ListCredentialsOutput } from "@/schemas/credential/dto"
import type { SortDirection, SortField, ViewMode } from "@/schemas/utils"
import type { ListPlatformsOutput } from "@/schemas/utils/dto"

import { DashboardAccountGridView } from "@/components/app/dashboard-account-grid-view"
import { DashboardAccountListView } from "@/components/app/dashboard-account-list-view"
import { DashboardAccountsHeader } from "@/components/app/dashboard-accounts-header"
import { EmptyState } from "@/components/shared/empty-state"

interface AccountsClientProps {
  initialData: {
    credentials: ListCredentialsOutput
    platforms: ListPlatformsOutput
  }
}

export function DashboardAccountsClient({ initialData }: AccountsClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [platformFilters, setPlatformFilters] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [showArchived, setShowArchived] = useState(false)

  // Toggle functions for multiselect filters
  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    )
  }

  const togglePlatformFilter = (platform: string) => {
    setPlatformFilters((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
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

  const { data: credentialsData } = useCredentials(
    { page: 1, limit: 50 },
    {
      initialData: initialData.credentials,
    }
  )
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

  const filteredCredentials = useMemo(() => {
    let filtered = credentials.filter((credential) => {
      const matchesSearch =
        searchTerm === "" ||
        credential.identifier
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (credential.description &&
          credential.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))

      const matchesStatus =
        statusFilters.length === 0 || statusFilters.includes(credential.status)

      const credentialPlatform = platforms.find(
        (p) => p.id === credential.platformId
      )
      const matchesPlatform =
        platformFilters.length === 0 ||
        (credentialPlatform &&
          platformFilters.includes(credentialPlatform.name))

      return matchesSearch && matchesStatus && matchesPlatform
    })

    if (sortField) {
      filtered = filtered.sort((a, b) => {
        let aValue: string | number | Date
        let bValue: string | number | Date

        switch (sortField) {
          case "identifier":
            aValue = a.identifier || ""
            bValue = b.identifier || ""
            break
          case "status":
            aValue = a.status || ""
            bValue = b.status || ""
            break
          case "lastViewed":
            aValue = a.lastViewed ? new Date(a.lastViewed) : new Date(0)
            bValue = b.lastViewed ? new Date(b.lastViewed) : new Date(0)
            break
          case "createdAt":
            aValue = new Date(a.createdAt)
            bValue = new Date(b.createdAt)
            break
          default:
            return 0
        }

        if (aValue < bValue) {
          return sortDirection === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortDirection === "asc" ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [
    credentials,
    platforms,
    searchTerm,
    statusFilters,
    platformFilters,
    sortField,
    sortDirection,
  ])

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl p-6">
        <DashboardAccountsHeader
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

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredCredentials.length}{" "}
            {filteredCredentials.length === 1 ? "account" : "accounts"}
          </p>
        </div>

        {/* Content */}
        {filteredCredentials.length === 0 ? (
          <EmptyState
            title="No accounts found"
            description="Try adjusting your search or filter criteria"
            actionLabel="Clear filters"
            onAction={clearAllFilters}
          />
        ) : (
          <>
            {viewMode === "list" ? (
              <DashboardAccountListView
                credentials={filteredCredentials}
                platforms={platforms}
              />
            ) : (
              <DashboardAccountGridView
                credentials={filteredCredentials}
                platforms={platforms}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
