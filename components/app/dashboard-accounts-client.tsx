"use client"

import { useMemo, useState } from "react"
import { credentialKeys } from "@/orpc/hooks/use-credentials"
import { platformKeys } from "@/orpc/hooks/use-platforms"
import type { ListCredentialsOutput } from "@/schemas/credential/dto"
import type { ListPlatformsOutput } from "@/schemas/utils/dto"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import { DashboardAccountGridView } from "@/components/app/dashboard-account-grid-view"
import { DashboardAccountListView } from "@/components/app/dashboard-account-list-view"
import { DashboardAccountsFilters } from "@/components/app/dashboard-accounts-filters"
import { DashboardAddCredentialDialog } from "@/components/app/dashboard-add-credential-dialog"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"

type ViewMode = "list" | "grid"

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
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const platforms = useMemo(() => {
    return initialData.platforms.platforms || []
  }, [initialData.platforms.platforms])

  const credentials = useMemo(() => {
    return initialData.credentials.credentials || []
  }, [initialData.credentials.credentials])

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

  // Create a query client and dehydrate the initial data
  const queryClient = new QueryClient()

  // Pre-populate the query cache with initial data
  queryClient.setQueryData(
    credentialKeys.list({ page: 1, limit: 50 }),
    initialData.credentials
  )
  queryClient.setQueryData(
    platformKeys.list({ page: 1, limit: 100 }),
    initialData.platforms
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen bg-gray-50/50">
        <div className="mx-auto max-w-7xl p-6">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Accounts</h1>
              <p className="mt-1 text-gray-600">
                Manage your accounts and credentials
              </p>
            </div>
            <div className="mt-4 flex items-center gap-3 sm:mt-0">
              <div className="flex items-center rounded-lg border bg-white p-1">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 px-3"
                >
                  <Icons.list className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 px-3"
                >
                  <Icons.grid className="h-4 w-4" />
                </Button>
              </div>
              <Button className="h-9" onClick={() => setAddDialogOpen(true)}>
                <Icons.add className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </div>
          </div>

          {/* Filters */}
          <DashboardAccountsFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            platformFilter={platformFilter}
            onPlatformFilterChange={setPlatformFilter}
            platforms={platformNames}
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

      <DashboardAddCredentialDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
    </HydrationBoundary>
  )
}
