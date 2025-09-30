"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCard, useCards } from "@/orpc/hooks/use-cards"
import { useCredential, useCredentials } from "@/orpc/hooks/use-credentials"
import { usePlatforms } from "@/orpc/hooks/use-platforms"
import { useSecret, useSecrets } from "@/orpc/hooks/use-secrets"

import { getLogoDevUrlWithToken, getPlaceholderImage } from "@/lib/utils"
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

  // Fetch individual resources when they're not found in the list
  const { data: individualCredential } = useCredential(currentId, {
    enabled: shouldFetchCredentials && !!currentId,
  })

  const { data: individualCard } = useCard(
    shouldFetchCards && !!currentId ? currentId : ""
  )

  const { data: individualSecret } = useSecret(
    shouldFetchSecrets && !!currentId ? currentId : ""
  )

  const getPlatform = (platformId: string) => {
    return (
      platforms?.platforms.find((p) => p.id === platformId) || {
        id: platformId,
        name: "unknown",
        logo: "",
      }
    )
  }

  const { items, isLoading, currentItem } = useMemo(() => {
    let baseItems: Array<{
      id: string
      name: string
      logo?: string
      platformName?: string
    }> = []
    let loading = false
    let current:
      | { id: string; name: string; logo?: string; platformName?: string }
      | undefined

    switch (resourceType) {
      case "accounts":
        loading = isLoadingCredentials
        if (credentials?.credentials) {
          baseItems = credentials.credentials.map((cred) => {
            const platform = getPlatform(cred.platformId)
            return {
              id: cred.id,
              name: cred.identifier,
              logo: platform.logo,
              platformName: platform.name,
            }
          })
        }

        // Check if current item is in the list
        current = baseItems.find((item) => item.id === currentId)

        // If not found and we have individual data, add it to the list
        if (!current && individualCredential) {
          const platform = getPlatform(individualCredential.platformId)
          current = {
            id: individualCredential.id,
            name: individualCredential.identifier,
            logo: platform.logo,
            platformName: platform.name,
          }
          baseItems = [current, ...baseItems]
        }
        break

      case "cards":
        loading = isLoadingCards
        if (cards?.cards) {
          baseItems = cards.cards.map((card) => ({
            id: card.id,
            name: card.name,
          }))
        }

        current = baseItems.find((item) => item.id === currentId)

        if (!current && individualCard) {
          current = {
            id: individualCard.id,
            name: individualCard.name,
          }
          baseItems = [current, ...baseItems]
        }
        break

      case "secrets":
        loading = isLoadingSecrets
        if (secrets?.secrets) {
          baseItems = secrets.secrets.map((secret) => ({
            id: secret.id,
            name: secret.name,
          }))
        }

        current = baseItems.find((item) => item.id === currentId)

        if (!current && individualSecret) {
          current = {
            id: individualSecret.id,
            name: individualSecret.name,
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
    getPlatform,
  ])

  const handleSelect = (newId: string) => {
    if (newId !== currentId) {
      router.push(`${basePath}/${newId}`)
    }
    setOpen(false)
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
            {currentItem.logo && (
              <Image
                src={getPlaceholderImage(
                  currentItem.platformName || "unknown",
                  getLogoDevUrlWithToken(currentItem.logo)
                )}
                alt={`${currentItem.platformName || "unknown"} logo`}
                width={16}
                height={16}
                className="bg-secondary size-4 shrink-0 rounded-full object-contain p-0.5"
              />
            )}
            <span className="truncate">{currentItem.name}</span>
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
                  key={item.id}
                  value={item.name}
                  onSelect={() => handleSelect(item.id)}
                  className="cursor-pointer"
                >
                  <div className="flex w-full items-center gap-2">
                    {item.logo && (
                      <Image
                        src={getPlaceholderImage(
                          item.platformName || "unknown",
                          getLogoDevUrlWithToken(item.logo)
                        )}
                        alt={`${item.platformName || "unknown"} logo`}
                        width={16}
                        height={16}
                        className="bg-secondary size-4 shrink-0 rounded-full object-contain p-0.5"
                      />
                    )}
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.id === currentId && (
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
