"use client"

import Image from "next/image"
import type { CredentialOutput } from "@/schemas/credential/dto"
import { PlatformOutput } from "@/schemas/utils/dto"

import { getLogoDevUrlWithToken, getPlaceholderImage } from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

import { Icons } from "@/components/shared/icons"
import { ItemActionsDropdown } from "@/components/shared/item-actions-dropdown"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface CredentialHeaderProps {
  credential: CredentialOutput
  platform: PlatformOutput
  onDelete?: () => void
}

export function CredentialHeader({
  credential,
  platform,
  onDelete,
}: CredentialHeaderProps) {
  const { copy, isCopied } = useCopyToClipboard({ successDuration: 1000 })

  const handleCopyId = async () => {
    await copy(credential.id)
  }

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <Image
          src={getPlaceholderImage(
            platform.name,
            getLogoDevUrlWithToken(platform.logo)
          )}
          alt={`${platform.name} logo`}
          width={64}
          height={64}
          className="bg-secondary size-16 rounded-full object-contain p-3"
        />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{credential.identifier}</h1>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleCopyId}
            >
              {isCopied ? (
                <Icons.check className="h-4 w-4" />
              ) : (
                <Icons.copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="text-muted-foreground flex items-center gap-2">
            <span>{platform.name}</span>
            <Separator orientation="vertical" className="h-4" />
            <StatusBadge status={credential.status} />
          </div>
        </div>
      </div>

      <ItemActionsDropdown
        onEdit={() => {
          // TODO: Implement edit
        }}
        onShare={() => {
          // TODO: Implement share
        }}
        onDuplicate={() => {
          // TODO: Implement duplicate
        }}
        onMove={() => {
          // TODO: Implement move
        }}
        onArchive={() => {
          // TODO: Implement archive
        }}
        onDelete={onDelete}
      />
    </div>
  )
}
