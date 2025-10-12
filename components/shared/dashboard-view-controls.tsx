"use client"

import { useState } from "react"
import type React from "react"
import type { SortDirection, ViewMode } from "@/schemas/utils"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export interface SortOption {
  field: string
  label: string
}

export interface ViewModeOption {
  mode: ViewMode
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export interface DashboardViewControlsProps {
  // View Mode
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  viewModeOptions?: ViewModeOption[]

  // Sorting
  sortField?: string | null
  sortDirection?: SortDirection
  onSortChange?: (field: string) => void
  sortOptions?: SortOption[]

  // Show Archived
  showArchived?: boolean
  onShowArchivedChange?: (show: boolean) => void
  archivedLabel?: string

  // Customization
  className?: string
  triggerLabel?: string
}

const defaultViewModeOptions: ViewModeOption[] = [
  { mode: "cards", label: "Cards", icon: Icons.grid },
  { mode: "rows", label: "Rows", icon: Icons.list },
]

export function DashboardViewControls({
  viewMode,
  onViewModeChange,
  viewModeOptions = defaultViewModeOptions,
  sortField,
  sortDirection = "asc",
  onSortChange,
  sortOptions = [],
  showArchived = false,
  onShowArchivedChange,
  archivedLabel = "Show archived items",
  className,
  triggerLabel = "Display",
}: DashboardViewControlsProps) {
  const [isDisplayOpen, setIsDisplayOpen] = useState(false)

  const hasViewMode = viewMode !== undefined && onViewModeChange
  const hasSorting = sortOptions.length > 0 && onSortChange
  const hasArchived = onShowArchivedChange !== undefined

  // Don't render if no functionality is provided
  if (!hasViewMode && !hasSorting && !hasArchived) {
    return null
  }

  return (
    <div className={className}>
      <Popover open={isDisplayOpen} onOpenChange={setIsDisplayOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <Icons.settings className="mr-2 size-4" />
            {triggerLabel}
            <Icons.chevronDown className="ml-2 size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="space-y-4 p-4">
            {hasViewMode && (
              <>
                <div className="space-y-3">
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Icons.view className="size-4" />
                    <span className="text-sm font-medium">View</span>
                  </div>
                  <div className="flex items-center rounded-lg border p-1">
                    {viewModeOptions.map((option) => (
                      <Button
                        key={option.mode}
                        variant={viewMode === option.mode ? "default" : "ghost"}
                        size="sm"
                        onClick={() => onViewModeChange?.(option.mode)}
                        className="h-8 flex-1"
                      >
                        <option.icon className="mr-2 size-4" />
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
                {(hasSorting || hasArchived) && <Separator />}
              </>
            )}

            {/* Ordering */}
            {hasSorting && (
              <>
                <div className="space-y-3">
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Icons.arrowUpDown className="size-4" />
                    <span className="text-sm font-medium">Ordering</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {sortOptions.map((option) => (
                      <Button
                        key={option.field}
                        variant={
                          sortField === option.field ? "default" : "outline"
                        }
                        size="sm"
                        className="h-8 justify-between text-xs"
                        onClick={() => onSortChange?.(option.field)}
                      >
                        {option.label}
                        {sortField === option.field && (
                          <span>
                            {sortDirection === "asc" ? (
                              <Icons.up className="size-3" />
                            ) : (
                              <Icons.down className="size-3" />
                            )}
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
                {hasArchived && <Separator />}
              </>
            )}

            {hasArchived && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icons.eye className="text-muted-foreground size-4" />
                    <span className="text-sm font-medium">{archivedLabel}</span>
                  </div>
                  <Switch
                    checked={showArchived}
                    onCheckedChange={onShowArchivedChange}
                  />
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
