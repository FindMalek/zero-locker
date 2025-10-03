"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  useDuplicateCredential,
  useUpdateCredential,
} from "@/orpc/hooks/use-credentials"
import type { CredentialOutput } from "@/schemas/credential/dto"
import type { PlatformSimpleRo } from "@/schemas/utils/platform"
import { format } from "date-fns"

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { useToast } from "@/hooks/use-toast"

import { DashboardDeleteCredentialDialog } from "@/components/app/dashboard-credential-delete-dialog"
import { DashboardMoveCredentialDialog } from "@/components/app/dashboard-credential-move-dialog"
import { Icons } from "@/components/shared/icons"
import { ItemActionsDropdown } from "@/components/shared/item-actions-dropdown"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface CredentialGridViewProps {
  credentials: CredentialOutput[]
  platforms: PlatformSimpleRo[]
}

export function DashboardCredentialGridView({
  credentials,
  platforms,
}: CredentialGridViewProps) {
  const router = useRouter()
  const { copy, isCopied } = useCopyToClipboard({ successDuration: 1000 })
  const { toast } = useToast()
  const duplicateCredentialMutation = useDuplicateCredential()
  const updateCredentialMutation = useUpdateCredential()
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

  const getPlatformName = (platformId: string) => {
    const platform = platforms.find((p) => p.id === platformId)
    return platform?.name || "Unknown Platform"
  }

  const handleCopy = async (text: string) => {
    await copy(text)
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

      // Navigate to the duplicated credential's edit page
      router.push(`/dashboard/accounts/${duplicatedCredential.id}`)
    } catch (error) {
      console.error("Failed to duplicate credential:", error)
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
      console.error("Failed to archive credential:", error)
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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {credentials.map((credential) => (
        <Card key={credential.id} className="transition-shadow hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-gray-100 p-2">
                  <Icons.user className="size-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="max-w-[150px] truncate text-sm font-semibold">
                    {credential.identifier}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {getPlatformName(credential.platformId)}
                  </p>
                </div>
              </div>
              <StatusBadge status={credential.status} compact />
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {credential.description && (
              <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                {credential.description}
              </p>
            )}

            <div className="mb-4 space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Created:</span>
                <span>
                  {format(new Date(credential.createdAt), "MMM dd, yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Viewed:</span>
                <span>
                  {credential.lastViewed
                    ? format(new Date(credential.lastViewed), "MMM dd, yyyy")
                    : "Never"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(credential.identifier)}
              >
                {isCopied ? (
                  <Icons.check className="size-4" />
                ) : (
                  <Icons.copy className="size-4" />
                )}
              </Button>

              <ItemActionsDropdown
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
              />
            </div>
          </CardContent>
        </Card>
      ))}

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
