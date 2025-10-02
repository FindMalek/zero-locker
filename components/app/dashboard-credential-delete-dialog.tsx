"use client"

import { useDeleteCredential } from "@/orpc/hooks/use-credentials"
import { useToast } from "@/hooks/use-toast"

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

interface DeleteCredentialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  credentialId: string
  credentialName: string
}

export function DashboardDeleteCredentialDialog({
  open,
  onOpenChange,
  credentialId,
  credentialName,
}: DeleteCredentialDialogProps) {
  const { toast } = useToast()
  const deleteCredentialMutation = useDeleteCredential()

  const handleDelete = async () => {
    try {
      await deleteCredentialMutation.mutateAsync({
        id: credentialId,
      })

      toast(
        "The credential has been deleted successfully.",
        "success"
      )

      onOpenChange(false)
    } catch (error) {
      toast(
        "Failed to delete credential. Please try again later.",
        "error"
      )
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Credential</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{credentialName}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
