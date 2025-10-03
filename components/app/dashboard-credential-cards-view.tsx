"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  useDuplicateCredential,
  useUpdateCredential,
} from "@/orpc/hooks/use-credentials"
import type { CredentialIncludeOutput } from "@/schemas/credential/dto"
import type { PlatformSimpleRo } from "@/schemas/utils/platform"

import { getRelativeTime } from "@/lib/date-utils"
import {
  getCreatedOrLastViewedText,
  getLogoDevUrlWithToken,
  getPlaceholderImage,
} from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { useToast } from "@/hooks/use-toast"

import { DashboardDeleteCredentialDialog } from "@/components/app/dashboard-credential-delete-dialog"
import { DashboardMoveCredentialDialog } from "@/components/app/dashboard-credential-move-dialog"
import { Icons } from "@/components/shared/icons"
import { ItemActionsContextMenu } from "@/components/shared/item-actions-dropdown"
import { StatusBadge } from "@/components/shared/status-badge"
import { TagDisplay } from "@/components/shared/tag-display"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CredentialListViewProps {
  credentials: CredentialIncludeOutput[]
  platforms: PlatformSimpleRo[]
}

export function DashboardCredentialCardsView({
  credentials,
  platforms,
}: CredentialListViewProps) {
  const router = useRouter()
  const { copy, isCopied } = useCopyToClipboard({
    successDuration: 1000,
  })
  const { toast } = useToast()
  const updateCredentialMutation = useUpdateCredential()
  const duplicateCredentialMutation = useDuplicateCredential()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [credentialToDelete, setCredentialToDelete] = useState<{
    id: string
    identifier: string
  } | null>(null)
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [credentialToMove, setCredentialToMove] = useState<{
    id: string
    identifier: string
    containerId?: string | null
  } | null>(null)

  const getPlatform = (platformId: string) => {
    return (
      platforms.find((p) => p.id === platformId) || {
        id: platformId,
        name: "unknown",
        logo: "",
      }
    )
  }

  const handleCopyIdentifier = async (
    identifier: string,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation()
    await copy(identifier)
  }

  const handleCardClick = (credentialId: string) => {
    router.push(`/dashboard/accounts/${credentialId}`)
  }

  const handleDuplicate = async (credentialId: string) => {
    try {
      const duplicatedCredential =
        await duplicateCredentialMutation.mutateAsync({
          id: credentialId,
        })

      toast(
        `"${duplicatedCredential.identifier}" has been created successfully.`,
        "success"
      )

      router.push(`/dashboard/accounts/${duplicatedCredential.id}`)
    } catch (error) {
      console.log(error)
      toast("Failed to duplicate credential. Please try again later.", "error")
    }
  }

  const handleArchive = async (credentialId: string) => {
    try {
      await updateCredentialMutation.mutateAsync({
        id: credentialId,
        status: "SUSPENDED",
      })

      toast("The credential has been archived successfully.", "success")
    } catch (error) {
      console.log(error)
      toast("Failed to archive credential. Please try again later.", "error")
    }
  }

  const handleShare = () => {
    toast(
      "Credential sharing is a PRO feature. Upgrade to share credentials with team members.",
      "info"
    )
  }

  const handleMove = (
    credentialId: string,
    credentialIdentifier: string,
    containerId?: string | null
  ) => {
    setCredentialToMove({
      id: credentialId,
      identifier: credentialIdentifier,
      containerId,
    })
    setMoveDialogOpen(true)
  }

  const handleDelete = (credentialId: string, credentialIdentifier: string) => {
    setCredentialToDelete({
      id: credentialId,
      identifier: credentialIdentifier,
    })
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-3">
      {credentials.map((credential) => {
        const platform = getPlatform(credential.platformId)
        const primaryDate = credential.lastViewed || credential.createdAt

        return (
          <ItemActionsContextMenu
            key={credential.id}
            onEdit={() => {
              router.push(`/dashboard/accounts/${credential.id}`)
            }}
            onShare={handleShare}
            onDuplicate={() => {
              handleDuplicate(credential.id)
            }}
            onMove={() => {
              handleMove(
                credential.id,
                credential.identifier,
                credential.containerId
              )
            }}
            onArchive={() => {
              handleArchive(credential.id)
            }}
            onDelete={() => {
              handleDelete(credential.id, credential.identifier)
            }}
          >
            <div
              className="dark:hover:bg-secondary/50 hover:border-secondary-foreground/20 border-secondary group flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-colors duration-200 hover:shadow-sm"
              onClick={() => handleCardClick(credential.id)}
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
                    <h3 className="hover:text-primary group-hover/identifier:text-primary truncate text-sm font-semibold transition-colors">
                      {credential.identifier}
                    </h3>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:text-primary  opacity-0 transition-all group-hover/identifier:opacity-100"
                      onClick={(e) =>
                        handleCopyIdentifier(credential.identifier, e)
                      }
                    >
                      {isCopied ? (
                        <Icons.check className="size-4" />
                      ) : (
                        <Icons.copy className="size-4" />
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
                      <Icons.clock className="size-4" />
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
            </div>
          </ItemActionsContextMenu>
        )
      })}

      {credentialToDelete && (
        <DashboardDeleteCredentialDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          credentialId={credentialToDelete.id}
          credentialIdentifier={credentialToDelete.identifier}
        />
      )}

      {credentialToMove && (
        <DashboardMoveCredentialDialog
          open={moveDialogOpen}
          onOpenChange={setMoveDialogOpen}
          credentialId={credentialToMove.id}
          credentialIdentifier={credentialToMove.identifier}
          currentContainerId={credentialToMove.containerId}
        />
      )}
    </div>
  )
}
