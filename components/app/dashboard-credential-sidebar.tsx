"use client"

import { useState } from "react"
import { useContainers } from "@/orpc/hooks/use-containers"
import { usePlatforms } from "@/orpc/hooks/use-platforms"
import type { CredentialOutput } from "@/schemas/credential/dto"
import { AccountStatus } from "@prisma/client"

import { getRelativeTime } from "@/lib/date-utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

import { Icons } from "@/components/shared/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CredentialSidebarProps {
  credential: CredentialOutput
  onStatusChange?: (status: AccountStatus) => void
  onContainerChange?: (containerId: string) => void
}

const statusConfig = {
  [AccountStatus.ACTIVE]: {
    label: "Active",
    color:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800",
    icon: Icons.check,
  },
  [AccountStatus.SUSPENDED]: {
    label: "Suspended",
    color:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-800",
    icon: Icons.warning,
  },
  [AccountStatus.DELETED]: {
    label: "Deleted",
    color:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800",
    icon: Icons.trash,
  },
}

export function CredentialSidebar({
  credential,
  onStatusChange,
  onContainerChange,
}: CredentialSidebarProps) {
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const { copy, isCopied } = useCopyToClipboard({ successDuration: 1500 })

  const { data: containersData } = useContainers({ page: 1, limit: 50 })
  const { data: platformsData } = usePlatforms({ page: 1, limit: 100 })

  const containers = containersData?.containers || []
  const currentContainer = containers.find(
    (c) => c.id === credential.containerId
  )
  const platform = platformsData?.platforms.find(
    (p) => p.id === credential.platformId
  )

  const currentStatus = statusConfig[credential.status]
  const StatusIcon = currentStatus.icon

  const handleStatusChange = async (newStatus: AccountStatus) => {
    if (onStatusChange) {
      setIsChangingStatus(true)
      try {
        await onStatusChange(newStatus)
      } finally {
        setIsChangingStatus(false)
      }
    }
  }

  const handleCopyIdentifier = async () => {
    await copy(credential.identifier)
  }

  return (
    <TooltipProvider>
      <div className="space-y-3 lg:space-y-4">
        {/* Status & Container Management - Always Visible */}
        <Card className="border-muted/50">
          <CardContent className="space-y-4 p-3 lg:p-4">
            {/* Status */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Status</Label>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`${currentStatus.color} flex-1 gap-1 px-2 py-0.5 text-xs font-medium`}
                >
                  <StatusIcon className="h-3 w-3" />
                  {currentStatus.label}
                </Badge>
                <Select
                  disabled={isChangingStatus}
                  value={credential.status}
                  onValueChange={(value) =>
                    handleStatusChange(value as AccountStatus)
                  }
                >
                  <SelectTrigger className="h-7 w-20 text-xs">
                    <Icons.settings className="h-3 w-3" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <SelectItem
                        key={status}
                        value={status}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <config.icon className="h-3 w-3" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Container */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">Container</Label>
              <Select
                value={credential.containerId || ""}
                onValueChange={onContainerChange}
              >
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue placeholder="Select container..." />
                </SelectTrigger>
                <SelectContent>
                  {containers.map((container) => (
                    <SelectItem
                      key={container.id}
                      value={container.id}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{container.icon}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">
                            {container.name}
                          </span>
                          <span className="text-muted-foreground text-[10px] capitalize">
                            {container.type.toLowerCase().replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - Compact */}
        <Card className="border-muted/50">
          <CardContent className="p-3 lg:p-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">
                Quick Actions
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={handleCopyIdentifier}
                    >
                      {isCopied ? (
                        <Icons.check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Icons.copy className="h-3 w-3" />
                      )}
                      <span className="ml-1 hidden sm:inline">Copy</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Copy identifier</p>
                  </TooltipContent>
                </Tooltip>

                {platform?.loginUrl && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => window.open(platform.loginUrl, "_blank")}
                      >
                        <Icons.arrowUpCircle className="h-3 w-3" />
                        <span className="ml-1 hidden sm:inline">Open</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Open platform</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collapsible Details */}
        <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <Card className="border-muted/50">
            <CollapsibleTrigger asChild>
              <CardHeader className="hover:bg-muted/25 cursor-pointer p-3 pb-2 transition-colors lg:p-4">
                <CardTitle className="text-foreground flex items-center justify-between text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Icons.info className="text-muted-foreground h-3 w-3" />
                    Details
                  </div>
                  <Icons.chevronDown
                    className={`h-3 w-3 transition-transform ${isDetailsOpen ? "rotate-180" : ""}`}
                  />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3 p-3 pt-0 lg:p-4">
                {/* Platform Info - Compact */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">
                    Platform
                  </Label>
                  <div className="bg-muted/50 flex items-center gap-2 rounded p-2">
                    {platform?.logo && (
                      <span className="flex-shrink-0 text-sm">
                        {platform.logo}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {platform?.name || "Unknown Platform"}
                      </p>
                      <p className="text-muted-foreground truncate text-[10px]">
                        {platform?.status.toLowerCase() || "unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Container Info - Only if exists */}
                {currentContainer && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs">
                        Container
                      </Label>
                      <div className="bg-muted/50 flex items-center gap-2 rounded p-2">
                        <span className="flex-shrink-0 text-sm">
                          {currentContainer.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">
                            {currentContainer.name}
                          </p>
                          <p className="text-muted-foreground text-[10px] capitalize">
                            {currentContainer.type
                              .toLowerCase()
                              .replace("_", " ")}{" "}
                            container
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Timeline - Compact */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs">
                    Timeline
                  </Label>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-medium">
                        {getRelativeTime(credential.createdAt)}
                      </span>
                    </div>

                    {credential.updatedAt.getTime() !==
                      credential.createdAt.getTime() && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Modified</span>
                        <span className="font-medium">
                          {getRelativeTime(credential.updatedAt)}
                        </span>
                      </div>
                    )}

                    {credential.lastViewed && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Last viewed
                        </span>
                        <span className="font-medium">
                          {getRelativeTime(credential.lastViewed)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </TooltipProvider>
  )
}
