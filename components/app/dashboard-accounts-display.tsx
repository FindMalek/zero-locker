"use client"

import { useState } from "react"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

import type { SortDirection, SortField, ViewMode } from "../../types/common"

interface DisplayProperty {
  id: string
  label: string
  enabled: boolean
  onChange: (enabled: boolean) => void
}

interface DashboardAccountsDisplayProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  sortField: SortField | null
  sortDirection: SortDirection
  onSortChange: (field: SortField) => void
  showArchived?: boolean
  onShowArchivedChange?: (show: boolean) => void
}

export function DashboardAccountsDisplay({
  viewMode,
  onViewModeChange,
  sortField,
  sortDirection,
  onSortChange,
  showArchived = false,
  onShowArchivedChange,
}: DashboardAccountsDisplayProps) {
  const [isDisplayOpen, setIsDisplayOpen] = useState(false)
  const [displayProperties, setDisplayProperties] = useState<DisplayProperty[]>(
    [
      {
        id: "identifier",
        label: "Identifier",
        enabled: true,
        onChange: () => {},
      },
      {
        id: "description",
        label: "Description",
        enabled: true,
        onChange: () => {},
      },
      { id: "status", label: "Status", enabled: true, onChange: () => {} },
      { id: "password", label: "Password", enabled: true, onChange: () => {} },
      {
        id: "lastViewed",
        label: "Last Viewed",
        enabled: true,
        onChange: () => {},
      },
      {
        id: "createdAt",
        label: "Created Date",
        enabled: true,
        onChange: () => {},
      },
      { id: "platform", label: "Platform", enabled: true, onChange: () => {} },
    ]
  )

  const sortOptions = [
    { field: "identifier" as SortField, label: "Identifier" },
    { field: "status" as SortField, label: "Status" },
    { field: "lastViewed" as SortField, label: "Last Viewed" },
    { field: "createdAt" as SortField, label: "Date Created" },
  ]

  const toggleDisplayProperty = (propertyId: string) => {
    setDisplayProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, enabled: !p.enabled } : p))
    )
  }

  return (
    <Popover open={isDisplayOpen} onOpenChange={setIsDisplayOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Icons.settings className="mr-2 h-4 w-4" />
          Display
          <Icons.chevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="space-y-4 p-4">
          {/* View Mode */}
          <div className="space-y-3">
            <div className="text-muted-foreground flex items-center gap-2">
              <Icons.view className="h-4 w-4 " />
              <span className="text-sm font-medium">View</span>
            </div>
            <div className="flex items-center rounded-lg border p-1 ">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("grid")}
                className="h-8 flex-1"
              >
                <Icons.grid className="mr-2 h-4 w-4" />
                Cards
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange("list")}
                className="h-8 flex-1"
              >
                <Icons.list className="mr-2 h-4 w-4" />
                Rows
              </Button>
            </div>
          </div>

          <Separator />

          {/* Ordering */}
          <div className="space-y-3">
            <div className="text-muted-foreground flex items-center gap-2">
              <Icons.arrowUpDown className="h-4 w-4 " />
              <span className="text-sm font-medium">Ordering</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {sortOptions.map((option) => (
                <Button
                  key={option.field}
                  variant={sortField === option.field ? "outline" : "secondary"}
                  size="sm"
                  className="h-8 justify-start text-xs"
                  onClick={() => onSortChange(option.field)}
                >
                  {option.label}
                  {sortField === option.field && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Show Archived Toggle */}
          {onShowArchivedChange && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icons.eye className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">
                    Show archived entities
                  </span>
                </div>
                <Switch
                  checked={showArchived}
                  onCheckedChange={onShowArchivedChange}
                />
              </div>
              <Separator />
            </>
          )}

          {/* Display Properties */}
          <div className="space-y-3">
            <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Display Properties
            </div>
            <div className="grid grid-cols-2 gap-2">
              {displayProperties.map((property) => (
                <Button
                  key={property.id}
                  variant={property.enabled ? "outline" : "secondary"}
                  size="sm"
                  onClick={() => toggleDisplayProperty(property.id)}
                  className={`flex items-center justify-between rounded border p-2 text-xs transition-all duration-200 hover:bg-gray-50`}
                >
                  <span className="font-medium">{property.label}</span>
                  {property.enabled && (
                    <Icons.check className="text-primary h-3 w-3" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
