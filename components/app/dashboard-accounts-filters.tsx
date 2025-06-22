"use client"

import type React from "react"
import { useState } from "react"
import { CredentialEntity } from "@/entities"
import { accountStatusEnum } from "@/schemas/credential"
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Filter,
  Globe,
  Tag,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

type FilterView = "main" | "status" | "platform"

interface FilterOption {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
}

interface DashboardAccountsFiltersProps {
  statusFilters: string[]
  onToggleStatusFilter: (status: string) => void
  platformFilters: string[]
  onTogglePlatformFilter: (platform: string) => void
  platforms: string[]
  onClearFilters: () => void
}

export function DashboardAccountsFilters({
  statusFilters,
  onToggleStatusFilter,
  platformFilters,
  onTogglePlatformFilter,
  platforms,
  onClearFilters,
}: DashboardAccountsFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [currentView, setCurrentView] = useState<FilterView>("main")

  const mainFilters: FilterOption[] = [
    {
      id: "status",
      label: "Status",
      icon: Tag,
      count: 3, // Number of status options
    },
    {
      id: "platform",
      label: "Platform",
      icon: Globe,
      count: platforms.length,
    },
  ]

  const statusOptions = [
    {
      value: accountStatusEnum.ACTIVE,
      label: CredentialEntity.convertAccountStatusToString(
        accountStatusEnum.ACTIVE
      ),
    },
    {
      value: accountStatusEnum.SUSPENDED,
      label: CredentialEntity.convertAccountStatusToString(
        accountStatusEnum.SUSPENDED
      ),
    },
    {
      value: accountStatusEnum.DELETED,
      label: CredentialEntity.convertAccountStatusToString(
        accountStatusEnum.DELETED
      ),
    },
  ]

  const platformOptions = platforms.map((platform) => ({
    value: platform,
    label: platform,
  }))

  const getActiveFilters = () => {
    const active: Array<{
      type: string
      label: string
      value: string
    }> = []

    statusFilters.forEach((status) => {
      const statusOption = statusOptions.find((opt) => opt.value === status)
      if (statusOption) {
        active.push({
          type: "status",
          label: statusOption.label,
          value: status,
        })
      }
    })

    platformFilters.forEach((platform) => {
      active.push({
        type: "platform",
        label: platform,
        value: platform,
      })
    })

    return active
  }

  const activeFilters = getActiveFilters()
  const totalActiveFilters = activeFilters.length

  const handleFilterClick = (filterId: string) => {
    setCurrentView(filterId as FilterView)
  }

  const handleBackClick = () => {
    setCurrentView("main")
  }

  const removeFilter = (type: string, value: string) => {
    if (type === "status") {
      onToggleStatusFilter(value)
    } else if (type === "platform") {
      onTogglePlatformFilter(value)
    }
  }

  const clearAllFilters = () => {
    onClearFilters()
    setCurrentView("main")
  }

  const getFilterCount = (filterId: string) => {
    if (filterId === "status") {
      return statusFilters.length > 0 ? statusFilters.length : undefined
    }
    if (filterId === "platform") {
      return platformFilters.length > 0 ? platformFilters.length : undefined
    }
    return undefined
  }

  const renderMainView = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        {mainFilters.map((filter) => {
          const activeCount = getFilterCount(filter.id)
          return (
            <button
              key={filter.id}
              onClick={() => handleFilterClick(filter.id)}
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors duration-200 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <filter.icon className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">{filter.label}</span>
                {activeCount && (
                  <Badge
                    variant="secondary"
                    className="h-5 border-blue-200 bg-blue-50 px-1.5 text-xs text-blue-700"
                  >
                    {activeCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{filter.count}</span>
                <ChevronDown className="h-4 w-4 rotate-[-90deg] text-gray-400" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderStatusView = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackClick}
          className="p-1"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Status</span>
          {statusFilters.length > 0 && (
            <Badge
              variant="secondary"
              className="h-5 border-blue-200 bg-blue-50 px-1.5 text-xs text-blue-700"
            >
              {statusFilters.length}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {statusOptions.map((option) => {
          const isSelected = statusFilters.includes(option.value)
          return (
            <button
              key={option.value}
              onClick={() => onToggleStatusFilter(option.value)}
              className={`flex w-full items-center justify-between rounded-lg border p-3 transition-colors duration-200 ${
                isSelected
                  ? "border-blue-200 bg-blue-50 text-blue-900"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className="text-sm font-medium">{option.label}</span>
              {isSelected && <Check className="h-4 w-4 text-blue-600" />}
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderPlatformView = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackClick}
          className="p-1"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Platform</span>
          {platformFilters.length > 0 && (
            <Badge
              variant="secondary"
              className="h-5 border-blue-200 bg-blue-50 px-1.5 text-xs text-blue-700"
            >
              {platformFilters.length}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {platformOptions.map((option) => {
          const isSelected = platformFilters.includes(option.value)
          return (
            <button
              key={option.value}
              onClick={() => onTogglePlatformFilter(option.value)}
              className={`flex w-full items-center justify-between rounded-lg border p-3 transition-colors duration-200 ${
                isSelected
                  ? "border-blue-200 bg-blue-50 text-blue-900"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className="text-sm font-medium">{option.label}</span>
              {isSelected && <Check className="h-4 w-4 text-blue-600" />}
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderActiveFilters = () => {
    if (activeFilters.length === 0) return null

    return (
      <>
        <Separator />
        <div className="space-y-3">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Active Filters
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <Badge
                key={`${filter.type}-${filter.value}-${index}`}
                variant="secondary"
                className="flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700"
              >
                {filter.label}
                <button
                  onClick={() => removeFilter(filter.type, filter.value)}
                  className="ml-1 rounded-full p-0.5 hover:bg-blue-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row">
      {/* Filter Dropdown */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="mr-2 h-4 w-4" />
            Filter
            {totalActiveFilters > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                {totalActiveFilters}
              </Badge>
            )}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4">
            {currentView === "main" && renderMainView()}
            {currentView === "status" && renderStatusView()}
            {currentView === "platform" && renderPlatformView()}

            {renderActiveFilters()}

            {totalActiveFilters > 0 && (
              <>
                <Separator className="my-3" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={clearAllFilters}
                >
                  Clear all filters
                </Button>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
