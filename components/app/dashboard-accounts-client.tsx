"use client"

import { useMemo, useState } from "react"
import { useCredentials } from "@/orpc/hooks/use-credentials"
import { usePlatforms } from "@/orpc/hooks/use-platforms"
import type { ListCredentialsOutput } from "@/schemas/credential/dto"
import type { ListPlatformsOutput } from "@/schemas/utils/dto"

import type { SortDirection, SortField, ViewMode } from "@/types/common"

import { DashboardAccountGridView } from "@/components/app/dashboard-account-grid-view"
import { DashboardAccountListView } from "@/components/app/dashboard-account-list-view"
import { DashboardAccountsFilters } from "@/components/app/dashboard-accounts-filters"
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
  const [statusFilter, setStatusFilter] = useState("all")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [showArchived, setShowArchived] = useState(false)

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
        statusFilter === "all" || credential.status === statusFilter

      const credentialPlatform = platforms.find(
        (p) => p.id === credential.platformId
      )
      const matchesPlatform =
        platformFilter === "all" || credentialPlatform?.name === platformFilter

      return matchesSearch && matchesStatus && matchesPlatform
    })
  }, [credentials, platforms, searchTerm, statusFilter, platformFilter])

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl p-6">
        <DashboardAccountsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          platformFilter={platformFilter}
          onPlatformFilterChange={setPlatformFilter}
          platforms={platformNames}
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
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setPlatformFilter("all")
              }}
            >
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
