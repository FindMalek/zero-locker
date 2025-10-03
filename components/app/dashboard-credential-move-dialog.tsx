"use client"

import { useUpdateCredential } from "@/orpc/hooks/use-credentials"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { useToast } from "@/hooks/use-toast"

import { ContainerSelector } from "@/components/shared/container-selector"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const moveCredentialSchema = z.object({
  containerId: z.string().optional(),
})

type MoveCredentialFormData = z.infer<typeof moveCredentialSchema>

interface MoveCredentialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  credentialId: string
  credentialIdentifier: string
  currentContainerId?: string | null
}

export function DashboardMoveCredentialDialog({
  open,
  onOpenChange,
  credentialId,
  credentialIdentifier,
  currentContainerId,
}: MoveCredentialDialogProps) {
  const { toast } = useToast()
  const updateCredentialMutation = useUpdateCredential()

  const form = useForm<MoveCredentialFormData>({
    resolver: zodResolver(moveCredentialSchema),
    defaultValues: {
      containerId: currentContainerId || undefined,
    },
  })

  const isMoving = updateCredentialMutation.isPending
  const selectedContainerId = form.watch("containerId")

  const handleMove = async (data: MoveCredentialFormData) => {
    if (data.containerId === currentContainerId) {
      onOpenChange(false)
      return
    }

    try {
      await updateCredentialMutation.mutateAsync({
        id: credentialId,
        containerId: data.containerId || undefined,
      })

      toast(`"${credentialIdentifier}" has been moved successfully.`, "success")
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error("Failed to move credential:", error)
      toast("Failed to move credential. Please try again later.", "error")
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
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
            Move
            <strong>&apos;{credentialIdentifier}&apos;</strong> to a different
            container.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleMove)} className="space-y-4">
            <FormField
              control={form.control}
              name="containerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Container</FormLabel>
                  <FormControl>
                    <ContainerSelector
                      currentContainerId={currentContainerId}
                      entityType="CREDENTIAL"
                      onContainerChange={field.onChange}
                      disabled={isMoving}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isMoving}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(handleMove)}
            disabled={isMoving || selectedContainerId === currentContainerId}
            className="disabled:opacity-50"
          >
            {isMoving && <Icons.spinner className="mr-2 size-4 animate-spin" />}
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
