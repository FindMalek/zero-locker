"use client"

import type { SortDirection, SortField, ViewMode } from "@/types/common"

import { DashboardAccountsDisplay } from "@/components/app/dashboard-accounts-display"
import { Icons } from "@/components/shared/icons"
import { Input } from "@/components/ui/input"

interface EntityFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  platformFilter: string
  onPlatformFilterChange: (value: string) => void
  platforms: string[]
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  sortField: SortField | null
  sortDirection: SortDirection
  onSortChange: (field: SortField) => void
  showArchived?: boolean
  onShowArchivedChange?: (show: boolean) => void
}

export function DashboardAccountsFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  platformFilter,
  onPlatformFilterChange,
  platforms,
  viewMode,
  onViewModeChange,
  sortField,
  sortDirection,
  onSortChange,
  showArchived,
  onShowArchivedChange,
}: EntityFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        <Input
          placeholder="Search by identifier or description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <DashboardAccountsDisplay
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={onSortChange}
        showArchived={showArchived}
        onShowArchivedChange={onShowArchivedChange}
      />
    </div>
  )
}
