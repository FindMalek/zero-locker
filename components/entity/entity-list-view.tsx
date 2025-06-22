"use client"

import type React from "react"
import Image from "next/image"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit,
  MoreHorizontal,
  Trash2,
} from "lucide-react"

import type { SortDirection, SortField } from "@/types/common"
import type { Entity } from "@/types/entity"

import { formatDate } from "@/lib/date-utils"

import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface EntityListViewProps {
  entities: Entity[]
  sortField: SortField | null
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onEdit?: (entity: Entity) => void
  onDelete?: (entity: Entity) => void
}

export function EntityListView({
  entities,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
}: EntityListViewProps) {
  const SortButton = ({
    field,
    children,
  }: {
    field: SortField
    children: React.ReactNode
  }) => (
    <Button
      variant="ghost"
      onClick={() => onSort(field)}
      className="h-auto p-0 font-semibold hover:bg-transparent"
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field ? (
          sortDirection === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </div>
    </Button>
  )

  return (
    <TooltipProvider>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton field="identifier">Identifier</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="status">Status</SortButton>
              </TableHead>
              <TableHead>Password</TableHead>
              <TableHead>
                <SortButton field="lastViewed">Last Viewed</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="createdAt">Created</SortButton>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entities.map((entity) => (
              <TableRow key={entity.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
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
                    <div>
                      <div className="font-medium">{entity.identifier}</div>
                      {entity.description && (
                        <div className="mt-1 text-sm text-gray-500">
                          {entity.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={entity.status} />
                </TableCell>
                <TableCell>
                  <Input
                    variant="password"
                    value={entity.password}
                    readOnly
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(entity.lastViewed)}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(entity.createdAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}
