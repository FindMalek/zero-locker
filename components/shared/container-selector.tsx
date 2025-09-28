"use client"

import { useEffect, useMemo, useState } from "react"
import { ContainerEntity } from "@/entities/utils/container/entity"
import { useContainers } from "@/orpc/hooks/use-containers"
import { EntityType } from "@/schemas/utils"
import { ContainerType } from "@prisma/client"

import {
  Feature,
  getUpgradeMessage,
  useUserPermissions,
  type UserPermissionFlags,
} from "@/lib/permissions"
import { validateEntityForContainer } from "@/lib/utils"

import { DashboardCreateContainerDialog } from "@/components/app/dashboard-create-container-dialog"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ContainerData {
  id: string
  name: string
  icon: string
  description?: string | null
  type: ContainerType
  isDefault: boolean
}

function ContainerList({
  containers,
  currentContainerId,
  onContainerSelect,
  canSelect,
}: {
  containers: ContainerData[]
  currentContainerId?: string | null
  onContainerSelect: (id: string) => void
  canSelect: boolean
}) {
  return (
    <div className="max-h-48 space-y-1 overflow-y-auto">
      {containers.map((container) => (
        <Button
          key={container.id}
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-start gap-2 p-2 text-xs"
          onClick={() => onContainerSelect(container.id)}
          disabled={container.id === currentContainerId || !canSelect}
        >
          <span className="text-sm">{container.icon}</span>
          <span className="truncate font-medium">{container.name}</span>
          {container.id === currentContainerId && (
            <Icons.check className="text-success ml-auto size-3" />
          )}
        </Button>
      ))}
    </div>
  )
}

function CreateContainerButton({
  canCreate,
  onCreateClick,
}: {
  canCreate: boolean
  onCreateClick: () => void
}) {
  if (canCreate) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={onCreateClick}
      >
        <Icons.add className="size-4" />
        Create new Container
      </Button>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              disabled={true}
            >
              <Icons.add className="size-4" />
              Create new Container
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="text-center">
            <p className="font-medium">
              {getUpgradeMessage(Feature.CONTAINERS).title}
            </p>
            <p className="text-xs">
              {getUpgradeMessage(Feature.CONTAINERS).description}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function ContainerSelectorContent({
  searchQuery,
  onSearchChange,
  containers,
  currentContainerId,
  onContainerSelect,
  onCreateClick,
  permissions,
}: {
  searchQuery: string
  onSearchChange: (query: string) => void
  containers: ContainerData[]
  currentContainerId?: string | null
  onContainerSelect: (id: string) => void
  onCreateClick: () => void
  permissions: UserPermissionFlags
}) {
  return (
    <PopoverContent align="end" className="w-72 p-0">
      <div className="space-y-3 p-3">
        {/* Search Bar */}
        <div className="relative">
          <Icons.search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
          <Input
            placeholder="Search containers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 pl-9"
          />
        </div>

        {containers.length > 0 ? (
          <ContainerList
            containers={containers}
            currentContainerId={currentContainerId}
            onContainerSelect={onContainerSelect}
            canSelect={permissions.canSelectContainers}
          />
        ) : (
          <div className="text-muted-foreground py-6 text-center text-sm">
            {searchQuery
              ? "No containers found"
              : "No compatible containers available"}
          </div>
        )}
      </div>

      <Separator />

      {/* Create Container Button */}
      <div className="p-3">
        <CreateContainerButton
          canCreate={permissions.canCreateContainers}
          onCreateClick={onCreateClick}
        />
      </div>
    </PopoverContent>
  )
}

interface ContainerSelectorProps {
  currentContainerId?: string | null
  entityType: EntityType
  onContainerChange?: (containerId: string) => void
  disabled?: boolean
  className?: string
}

export function ContainerSelector({
  currentContainerId,
  entityType,
  onContainerChange,
  disabled = false,
  className,
}: ContainerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const permissions = useUserPermissions()
  const { data: containersData, refetch } = useContainers({
    page: 1,
    limit: 50,
  })

  const containers = useMemo(
    () => containersData?.containers || [],
    [containersData]
  )
  const currentContainer = containers.find((c) => c.id === currentContainerId)

  // Auto-select default container for normal users
  useEffect(() => {
    if (
      !permissions.shouldPreSelectDefaultContainer ||
      currentContainerId ||
      !onContainerChange
    )
      return

    const targetType =
      ContainerEntity.getDefaultContainerTypeForEntity(entityType)
    const defaultContainer = containers.find(
      (container) => container.isDefault && container.type === targetType
    )

    if (defaultContainer) {
      onContainerChange(defaultContainer.id)
    }
  }, [
    permissions.shouldPreSelectDefaultContainer,
    currentContainerId,
    containers,
    entityType,
    onContainerChange,
  ])

  // Filter containers that can accept this entity type and match search
  const compatibleContainers = useMemo(
    () =>
      containers
        .filter((container) =>
          validateEntityForContainer(container.type, entityType)
        )
        .filter(
          (container) =>
            container.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            container.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
        ),
    [containers, entityType, searchQuery]
  )

  const handleContainerChange = async (containerId: string) => {
    if (onContainerChange && containerId !== currentContainerId) {
      onContainerChange(containerId)
      setPopoverOpen(false)
    }
  }

  const handleContainerCreated = async (containerId: string) => {
    await refetch()
    if (onContainerChange) {
      await handleContainerChange(containerId)
    }
  }

  const handleCreateClick = () => {
    setCreateDialogOpen(true)
    setPopoverOpen(false)
  }

  return (
    <>
      <div className={className}>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              className={`w-full rounded-lg border p-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                currentContainer
                  ? "border-border bg-card hover:bg-accent"
                  : "border-muted-foreground/25 bg-muted/10 hover:bg-muted/20 border-dashed"
              }`}
              disabled={disabled}
              type="button"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentContainer ? (
                    <>
                      <span className="text-sm">{currentContainer.icon}</span>
                      <p className="text-sm font-medium">
                        {currentContainer.name}
                      </p>
                    </>
                  ) : (
                    <>
                      <Icons.folder className="text-muted-foreground size-4" />
                      <span className="text-muted-foreground text-sm">
                        No container assigned
                      </span>
                    </>
                  )}
                </div>
                <Icons.chevronDown className="text-muted-foreground size-3" />
              </div>
            </button>
          </PopoverTrigger>
          <ContainerSelectorContent
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            containers={compatibleContainers}
            currentContainerId={currentContainerId}
            onContainerSelect={handleContainerChange}
            onCreateClick={handleCreateClick}
            permissions={permissions}
          />
        </Popover>
      </div>

      <DashboardCreateContainerDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onContainerCreated={handleContainerCreated}
      />
    </>
  )
}
