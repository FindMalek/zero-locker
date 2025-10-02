"use client"

import type { CredentialOutput } from "@/schemas/credential/dto"
import type { PlatformSimpleRo } from "@/schemas/utils/platform"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { useDuplicateCredential, useUpdateCredential, useDeleteCredential } from "@/orpc/hooks/use-credentials"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { MoveCredentialDialog } from "@/components/shared/move-credential-dialog"

import { Icons } from "@/components/shared/icons"
import { ItemActionsDropdown } from "@/components/shared/item-actions-dropdown"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  const deleteCredentialMutation = useDeleteCredential()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [credentialToDelete, setCredentialToDelete] = useState<string | null>(null)
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [credentialToMove, setCredentialToMove] = useState<{
    id: string
    name: string
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
      const duplicatedCredential = await duplicateCredentialMutation.mutateAsync({
        id: credentialId,
      })
      
      toast({
        title: "Credential duplicated",
        description: `"${duplicatedCredential.identifier}" has been created successfully.`,
      })

      // Navigate to the duplicated credential's edit page
      router.push(`/dashboard/accounts/${duplicatedCredential.id}`)
    } catch (error) {
      toast({
        title: "Failed to duplicate credential",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleArchive = async (credentialId: string) => {
    try {
      await updateCredentialMutation.mutateAsync({
        id: credentialId,
        status: "SUSPENDED",
      })
      
      toast({
        title: "Credential archived",
        description: "The credential has been archived successfully.",
      })
    } catch (error) {
      toast({
        title: "Failed to archive credential",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleShare = () => {
    toast({
      title: "Share Feature",
      description: "Credential sharing is a PRO feature. Upgrade to share credentials with team members.",
      variant: "default",
    })
  }

  const handleMove = (credentialId: string, credentialName: string, containerId?: string | null) => {
    setCredentialToMove({
      id: credentialId,
      name: credentialName,
      containerId,
    })
    setMoveDialogOpen(true)
  }

  const handleDelete = (credentialId: string) => {
    setCredentialToDelete(credentialId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!credentialToDelete) return

    try {
      await deleteCredentialMutation.mutateAsync({
        id: credentialToDelete,
      })
      
      toast({
        title: "Credential deleted",
        description: "The credential has been deleted successfully.",
      })
      
      setDeleteDialogOpen(false)
      setCredentialToDelete(null)
    } catch (error) {
      toast({
        title: "Failed to delete credential",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
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
                  handleMove(credential.id, credential.identifier, credential.containerId)
                }}
                onArchive={() => {
                  handleArchive(credential.id)
                }}
                onDelete={() => {
                  handleDelete(credential.id)
                }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Credential</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this credential? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {credentialToMove && (
        <MoveCredentialDialog
          open={moveDialogOpen}
          onOpenChange={setMoveDialogOpen}
          credentialId={credentialToMove.id}
          credentialName={credentialToMove.name}
          currentContainerId={credentialToMove.containerId}
        />
      )}
    </div>
  )
}
