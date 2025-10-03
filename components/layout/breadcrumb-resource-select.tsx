"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCard, useCards } from "@/orpc/hooks/use-cards"
import { useCredential, useCredentials } from "@/orpc/hooks/use-credentials"
import { usePlatforms } from "@/orpc/hooks/use-platforms"
import { useSecret, useSecrets } from "@/orpc/hooks/use-secrets"
import type { BreadcrumbItem } from "@/schemas/utils/breadcrumb"

import { getLogoDevUrlWithToken, getPlaceholderImage } from "@/lib/utils"
import { PlatformEntity } from "@/entities/utils/platform"
import type { ResourceType } from "@/lib/utils/breadcrumb-helpers"

import { Icons } from "@/components/shared/icons"
import { BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"

interface ResourceSelectProps {
  resourceType: ResourceType
  currentId: string
  basePath: string
}

export function BreadcrumbResourceSelect({
  resourceType,
  currentId,
  basePath,
}: ResourceSelectProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const shouldFetchCards = resourceType === "cards"
  const shouldFetchSecrets = resourceType === "secrets"
  const shouldFetchCredentials = resourceType === "accounts"

  const { data: credentials, isLoading: isLoadingCredentials } = useCredentials(
    { page: 1, limit: 100 },
    { enabled: shouldFetchCredentials }
  )

  const { data: cards, isLoading: isLoadingCards } = useCards(
    {
      page: 1,
      limit: 100,
    },
    { enabled: shouldFetchCards }
  )

  const { data: secrets, isLoading: isLoadingSecrets } = useSecrets(
    {
      page: 1,
      limit: 100,
    },
    { enabled: shouldFetchSecrets }
  )

  const { data: platforms } = usePlatforms(
    {
      page: 1,
      limit: 100,
    },
    { enabled: shouldFetchCredentials }
  )

  const { data: individualCredential } = useCredential(currentId, {
    enabled: shouldFetchCredentials && !!currentId,
  })

  const { data: individualCard } = useCard(
    shouldFetchCards && !!currentId ? currentId : ""
  )

  const { data: individualSecret } = useSecret(
    shouldFetchSecrets && !!currentId ? currentId : ""
  )

  const { items, isLoading, currentItem } = useMemo(() => {
    const getPlatform = (platformId: string) => {
      if (!platforms?.platforms) {
        throw new Error("Platforms not loaded")
      }

      return PlatformEntity.findById(platforms.platforms, platformId)
    }

    let baseItems: BreadcrumbItem[] = []
    let loading = false
    let current: BreadcrumbItem | undefined

    switch (resourceType) {
      case "accounts":
        loading = isLoadingCredentials
        if (credentials?.credentials) {
          baseItems = credentials.credentials.map((cred) => {
            const platform = getPlatform(cred.platformId)
            return {
              type: "credential",
              data: {
                credential: cred,
                platform: platform,
              }
            }
          })
        }

        current = baseItems.find((item) => getItemId(item) === currentId)

        if (!current && individualCredential) {
          const platform = getPlatform(individualCredential.platformId)
          current = {
            type: "credential",
            data: {
              credential: individualCredential,
              platform: platform,
            }
          }
          baseItems = [current, ...baseItems]
        }
        break

      case "cards":
        loading = isLoadingCards
        if (cards?.cards) {
          baseItems = cards.cards.map((card) => ({
            type: "card",
            data: {
              card: card,
            }
          }))
        }

        current = baseItems.find((item) => getItemId(item) === currentId)

        if (!current && individualCard) {
          current = {
            type: "card",
            data: {
              card: individualCard,
            }
          }
          baseItems = [current, ...baseItems]
        }
        break

      case "secrets":
        loading = isLoadingSecrets
        if (secrets?.secrets) {
          baseItems = secrets.secrets.map((secret) => ({
            type: "secret",
            data: {
              secret: secret,
            }
          }))
        }

        current = baseItems.find((item) => getItemId(item) === currentId)

        if (!current && individualSecret) {
          current = {
            type: "secret",
            data: {
              secret: individualSecret,
            }
          }
          baseItems = [current, ...baseItems]
        }
        break
    }

    return {
      items: baseItems,
      isLoading: loading,
      currentItem: current,
    }
  }, [
    resourceType,
    credentials,
    cards,
    secrets,
    currentId,
    isLoadingCredentials,
    isLoadingCards,
    isLoadingSecrets,
    individualCredential,
    individualCard,
    individualSecret,
    platforms,
  ])

  const handleSelect = (newId: string) => {
    if (newId !== currentId) {
      router.push(`${basePath}/${newId}`)
    }
    setOpen(false)
  }

  // Helper functions to extract display properties from typed items
  const getItemId = (item: BreadcrumbItem): string => {
    switch (item.type) {
      case "credential":
        return item.data.credential.id
      case "card":
        return item.data.card.id
      case "secret":
        return item.data.secret.id
    }
  }

  const getItemDisplayName = (item: BreadcrumbItem): string => {
    switch (item.type) {
      case "credential":
        return item.data.credential.identifier
      case "card":
        return item.data.card.name
      case "secret":
        return item.data.secret.name
    }
  }

  const getItemLogo = (item: BreadcrumbItem): string | undefined => {
    switch (item.type) {
      case "credential":
        return item.data.platform.logo
      case "card":
        return undefined // Cards don't have logos
      case "secret":
        return undefined // Secrets don't have logos
    }
  }

  const getItemPlatformName = (item: BreadcrumbItem): string | undefined => {
    switch (item.type) {
      case "credential":
        return item.data.platform.name
      case "card":
        return undefined
      case "secret":
        return undefined
    }
  }

  if (isLoading) {
    return (
      <div className="flex max-w-[200px] items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          {resourceType === "accounts" && (
            <Skeleton className="size-4 shrink-0 rounded-full" />
          )}
          <Skeleton className="size-4 min-w-[120px] flex-1" />
        </div>
        <Icons.chevronDown className="ml-2 size-4 shrink-0" />
      </div>
    )
  }

  // Only show UUID fallback if we've finished loading and still don't have the item
  if (!currentItem && !isLoading) {
    return <BreadcrumbPage>{currentId}</BreadcrumbPage>
  }

  // Show loading state if we don't have the current item yet
  if (!currentItem) {
    return (
      <div className="flex max-w-[200px] items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          {resourceType === "accounts" && (
            <Skeleton className="size-4 shrink-0 rounded-full" />
          )}
          <Skeleton className="size-4 min-w-[120px] flex-1" />
        </div>
        <Icons.chevronDown className="ml-2 size-4 shrink-0" />
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="hover:bg-accent hover:text-accent-foreground h-auto justify-between border-0 bg-transparent p-0 font-medium focus:ring-0 focus:ring-offset-0"
        >
          <div className="flex max-w-[200px] items-center gap-2 truncate">
            {getItemLogo(currentItem) && (
              <Image
                src={getPlaceholderImage(
                  getItemPlatformName(currentItem) || "unknown",
                  getLogoDevUrlWithToken(getItemLogo(currentItem)!)
                )}
                alt={`${getItemPlatformName(currentItem) || "unknown"} logo`}
                width={16}
                height={16}
                className="bg-secondary size-4 shrink-0 rounded-full object-contain p-0.5"
              />
            )}
            <span className="truncate">{getItemDisplayName(currentItem)}</span>
          </div>
          <Icons.chevronDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${resourceType}...`} />
          <CommandList>
            <CommandEmpty>No {resourceType} found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={getItemId(item)}
                  value={getItemDisplayName(item)}
                  onSelect={() => handleSelect(getItemId(item))}
                  className="cursor-pointer"
                >
                  <div className="flex w-full items-center gap-2">
                    {getItemLogo(item) && (
                      <Image
                        src={getPlaceholderImage(
                          getItemPlatformName(item) || "unknown",
                          getLogoDevUrlWithToken(getItemLogo(item)!)
                        )}
                        alt={`${getItemPlatformName(item) || "unknown"} logo`}
                        width={16}
                        height={16}
                        className="bg-secondary size-4 shrink-0 rounded-full object-contain p-0.5"
                      />
                    )}
                    <span className="flex-1 truncate">{getItemDisplayName(item)}</span>
                    {getItemId(item) === currentId && (
                      <Icons.check className="text-primary size-4 shrink-0" />
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
