"use client"

import type { CredentialOutput } from "@/schemas/credential/dto"

import { formatDate } from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"

interface CredentialHeaderProps {
  credential: CredentialOutput
  onDelete?: () => void
}

export function CredentialHeader({
  credential,
  onDelete,
}: CredentialHeaderProps) {
  const { copy, isCopied } = useCopyToClipboard({ successDuration: 1000 })

  const handleCopyId = async () => {
    await copy(credential.id)
  }

  return (
    <div className="border-border flex items-center justify-between border-b pb-4">
      <div>
        <p className="text-muted-foreground text-sm">ID: {credential.id}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleCopyId}>
          {isCopied ? (
            <Icons.check className="h-4 w-4" />
          ) : (
            <Icons.copy className="h-4 w-4" />
          )}
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Icons.trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

interface CredentialFooterProps {
  credential: CredentialOutput
}

export function CredentialFooter({ credential }: CredentialFooterProps) {
  return (
    <div className="text-muted-foreground border-border flex items-center gap-2 border-t pt-6 text-xs">
      <Icons.user className="h-3 w-3" />
      <span>Created by System Admin • {formatDate(credential.createdAt)}</span>
    </div>
  )
}
