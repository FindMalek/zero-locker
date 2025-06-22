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
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"

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
  const [sortDirection] = useState<SortDirection>("asc")
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

  const platformNames = useMemo(() => {
    return Array.from(
      new Set(platforms.map((platform) => platform.name))
    ).sort()
  }, [platforms])

  const filteredCredentials = useMemo(() => {
    return credentials.filter((credential) => {
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
  }, [credentials, platforms, searchTerm, statusFilters, platformFilters])

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
          platforms={platformNames}
          onClearFilters={clearAllFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={setSortField}
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
          <div className="py-12 text-center">
            <div className="mb-4 text-gray-400">
              <Icons.grid className="mx-auto h-12 w-12" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No accounts found
            </h3>
            <p className="mb-4 text-gray-600">
              Try adjusting your search or filter criteria
            </p>
            <Button variant="outline" onClick={clearAllFilters}>
              Clear filters
            </Button>
          </div>
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
