"use client"

import { Clock, Edit, MoreHorizontal, Trash2 } from "lucide-react"

import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { getPrimaryDate } from "../../lib/date-utils"
import type { Entity } from "../../types/entity"
import { PlatformLogo } from "../common/platform-logo"

interface EntityCardProps {
  entity: Entity
  onEdit?: (entity: Entity) => void
  onDelete?: (entity: Entity) => void
}

export function DashboardCredentialCard({
  entity,
  onEdit,
  onDelete,
}: EntityCardProps) {
  const primaryDate = getPrimaryDate(entity.lastViewed, entity.createdAt)

  return (
    <TooltipProvider>
      <Card className="group border border-gray-200/60 bg-white transition-all duration-200 hover:shadow-md">
        <CardContent className="p-4">
          {/* Header */}
          <div className="mb-3 flex items-start gap-3">
            <Tooltip>
              <TooltipTrigger>
                <PlatformLogo
                  platform={entity.platform}
                  size={20}
                  showLabel={false}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{entity.platform}</p>
              </TooltipContent>
            </Tooltip>
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 break-all text-sm font-medium leading-tight text-gray-900">
                {entity.identifier}
              </h3>
            </div>
            <div className="flex flex-shrink-0 items-start gap-1">
              <StatusBadge status={entity.status} compact />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(entity)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDelete?.(entity)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Description */}
          {entity.description && (
            <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-600">
              {entity.description}
            </p>
          )}

          {/* Password */}
          <div className="mb-3">
            <Input
              variant="password"
              value={entity.password}
              readOnly
              className="h-8 text-xs"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-2">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{primaryDate.relative}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {primaryDate.label}: {primaryDate.absolute}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
