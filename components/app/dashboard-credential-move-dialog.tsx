"use client"

import Image from "next/image"
import { useUpdateCredential } from "@/orpc/hooks/use-credentials"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { PlatformEntity } from "@/entities/utils/platform"
import type { CredentialOutput } from "@/schemas/credential/dto"
import type { PlatformSimpleRo } from "@/schemas/utils/platform"

import { useUserPermissions } from "@/lib/permissions"
import { getLogoDevUrlWithToken, getPlaceholderImage } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

import { ContainerSelector } from "@/components/shared/container-selector"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog"
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
  credential: CredentialOutput
  platforms: PlatformSimpleRo[]
}

export function DashboardMoveCredentialDialog({
  open,
  onOpenChange,
  credential,
  platforms,
}: MoveCredentialDialogProps) {
  const { toast } = useToast()
  const permissions = useUserPermissions()
  const updateCredentialMutation = useUpdateCredential()

  const form = useForm<MoveCredentialFormData>({
    resolver: zodResolver(moveCredentialSchema),
    defaultValues: {
      containerId: credential.containerId || undefined,
    },
  })

  const isMoving = updateCredentialMutation.isPending
  const selectedContainerId = form.watch("containerId")

  // Check if user can move credentials (PRO plan only)
  const canMoveCredential = permissions.canSelectContainers

  // Get platform data
  const platform = PlatformEntity.findById(platforms, credential.platformId)

  const handleMove = async (data: MoveCredentialFormData) => {
    if (!canMoveCredential) {
      toast("Moving credentials is only available for PRO plan users.", "error")
      return
    }

    if (data.containerId === credential.containerId) {
      onOpenChange(false)
      return
    }

    try {
      await updateCredentialMutation.mutateAsync({
        id: credential.id,
        containerId: data.containerId || undefined,
      })

      toast(`"${credential.identifier}" has been moved successfully.`, "success")
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
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2">
            <Icons.move className="size-5" />
            Move {credential.identifier}
          </DialogTitle>
          <DialogDescription>
            Select a container to move this credential to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <div className="bg-secondary flex size-10 flex-shrink-0 items-center justify-center rounded-full">
                <Image
                  src={getPlaceholderImage(
                    platform.name,
                    getLogoDevUrlWithToken(platform.logo)
                  )}
                  alt={`${platform.name} logo`}
                  width={24}
                  height={24}
                  className="bg-secondary size-6 rounded-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-foreground text-sm font-semibold">
                  {credential.identifier}
                </div>
                {credential.description && (
                  <div className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                    {credential.description}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleMove)} className="space-y-4">
              <FormField
                control={form.control}
                name="containerId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ContainerSelector
                        currentContainerId={field.value}
                        entityType="CREDENTIAL"
                        onContainerChange={field.onChange}
                        disabled={isMoving || !canMoveCredential}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isMoving}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(handleMove)}
            disabled={isMoving || selectedContainerId === credential.containerId || !canMoveCredential}
            className="disabled:opacity-50"
          >
            {isMoving && <Icons.spinner className="mr-2 size-4 animate-spin" />}
            Move credential
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
