"use client"

import { useState } from "react"
import { useContainers } from "@/orpc/hooks/use-containers"
import { useUpdateCredential } from "@/orpc/hooks/use-credentials"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ContainerSelector } from "@/components/shared/container-selector"
import { Icons } from "@/components/shared/icons"

interface MoveCredentialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  credentialId: string
  credentialName: string
  currentContainerId?: string | null
}

export function MoveCredentialDialog({
  open,
  onOpenChange,
  credentialId,
  credentialName,
  currentContainerId,
}: MoveCredentialDialogProps) {
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(
    currentContainerId || null
  )
  const [isMoving, setIsMoving] = useState(false)
  
  const { toast } = useToast()
  const updateCredentialMutation = useUpdateCredential()
  const { data: containersData } = useContainers({ page: 1, limit: 100 })

  const handleMove = async () => {
    if (selectedContainerId === currentContainerId) {
      onOpenChange(false)
      return
    }

    setIsMoving(true)
    try {
      await updateCredentialMutation.mutateAsync({
        id: credentialId,
        containerId: selectedContainerId || undefined,
      })

      toast({
        title: "Credential moved",
        description: `"${credentialName}" has been moved successfully.`,
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Failed to move credential",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsMoving(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset selection when dialog closes
      setSelectedContainerId(currentContainerId || null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.move className="size-5" />
            Move Credential
          </DialogTitle>
          <DialogDescription>
            Move "{credentialName}" to a different container.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ContainerSelector
            currentContainerId={currentContainerId}
            entityType="CREDENTIAL"
            onContainerChange={setSelectedContainerId}
            disabled={isMoving}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isMoving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={
              isMoving ||
              selectedContainerId === currentContainerId ||
              updateCredentialMutation.isPending
            }
          >
            {isMoving ? (
              <>
                <Icons.spinner className="mr-2 size-4 animate-spin" />
                Moving...
              </>
            ) : (
              "Move"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
