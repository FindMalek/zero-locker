"use client"

import Image from "next/image"
import type { CredentialIncludeOutput } from "@/schemas/credential/dto"
import type { PlatformSimpleRo } from "@/schemas/utils/platform"

import {
  getCreatedOrLastViewedText,
  getLogoDevUrlWithToken,
  getPlaceholderImage,
  getRelativeTime,
} from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

import { Icons } from "@/components/shared/icons"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { TagDisplay } from "../shared/tag-display"

interface CredentialListViewProps {
  credentials: CredentialIncludeOutput[]
  platforms: PlatformSimpleRo[]
}

export function DashboardAccountCardsView({
  credentials,
  platforms,
}: CredentialListViewProps) {
  const { copy, isCopied } = useCopyToClipboard({
    successDuration: 1000, // 1 second for the check icon
  })

  const getPlatform = (platformId: string) => {
    return (
      platforms.find((p) => p.id === platformId) || {
        id: platformId,
        name: "unknown",
        logo: "",
      }
    )
  }

  const handleCopyIdentifier = async (identifier: string) => {
    await copy(identifier)
  }

  return (
    <div className="space-y-3">
      {credentials.map((credential) => {
        const platform = getPlatform(credential.platformId)
        const primaryDate = credential.lastViewed || credential.createdAt

        return (
          <div
            key={credential.id}
            className="dark:hover:bg-secondary/50 hover:border-secondary-foreground/20 border-secondary group flex items-center gap-4 rounded-lg border-2 p-4 transition-colors duration-200 hover:shadow-sm"
          >
            <Tooltip>
              <TooltipTrigger>
                <Image
                  src={getPlaceholderImage(
                    platform.name,
                    getLogoDevUrlWithToken(platform.logo)
                  )}
                  alt={`${platform.name} logo`}
                  width={64}
                  height={64}
                  className="bg-secondary size-10 rounded-full object-contain p-2"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{platform.name}</p>
              </TooltipContent>
            </Tooltip>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <div className="group/identifier flex items-center gap-1">
                  <h3
                    className="hover:text-primary group-hover/identifier:text-primary cursor-pointer truncate text-sm font-semibold transition-colors"
                    onClick={() => handleCopyIdentifier(credential.identifier)}
                  >
                    {credential.identifier}
                  </h3>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-primary h-6 w-6 p-0 opacity-0 transition-all group-hover/identifier:opacity-100"
                    onClick={() => handleCopyIdentifier(credential.identifier)}
                  >
                    {isCopied ? (
                      <Icons.check className="h-3 w-3" />
                    ) : (
                      <Icons.copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {credential.description && (
                <p className="text-muted-foreground truncate text-sm">
                  {credential.description}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="text-muted-foreground flex items-center gap-4 text-sm">
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1">
                    <Icons.clock className="h-3 w-3" />
                    <span>{getRelativeTime(primaryDate)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {getCreatedOrLastViewedText(
                      primaryDate,
                      !!credential.lastViewed
                    )}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            <TagDisplay tags={credential.tags} size="sm" />

            <StatusBadge status={credential.status} compact />

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Icons.more className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Icons.eye className="mr-2 h-3 w-3" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Icons.edit className="mr-2 h-3 w-3" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Icons.trash className="mr-2 h-3 w-3" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )
      })}
    </div>
  )
}
