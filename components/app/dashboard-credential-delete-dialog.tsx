"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { PlatformEntity } from "@/entities/utils/platform"
import { useDeleteCredential } from "@/orpc/hooks/use-credentials"
import type { CredentialOutput } from "@/schemas/credential/dto"
import type { PlatformSimpleRo } from "@/schemas/utils/platform"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { getLogoDevUrlWithToken, getPlaceholderImage } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

import { Icons } from "@/components/shared/icons"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const deleteCredentialSchema = z.object({
  confirmationText: z.string().min(1, "Confirmation text is required"),
})

type DeleteCredentialFormData = z.infer<typeof deleteCredentialSchema>

interface DeleteCredentialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  credential: CredentialOutput
  platforms: PlatformSimpleRo[]
  shouldRedirect?: boolean
}

// Needs a complete redesign of UI
export function DashboardDeleteCredentialDialog({
  open,
  onOpenChange,
  credential,
  platforms,
  shouldRedirect = false,
}: DeleteCredentialDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const deleteCredentialMutation = useDeleteCredential()

  const form = useForm<DeleteCredentialFormData>({
    resolver: zodResolver(deleteCredentialSchema),
    defaultValues: {
      confirmationText: "",
    },
  })

  const isDeleting = deleteCredentialMutation.isPending
  const confirmationText = form.watch("confirmationText")
  const isConfirmationValid = confirmationText === credential.identifier

  // Get platform data
  const platform = PlatformEntity.findById(platforms, credential.platformId)

  // Don't render if we don't have valid credential data
  if (!credential?.id || !credential?.identifier) {
    return null
  }

  const handleDelete = async (data: DeleteCredentialFormData) => {
    if (data.confirmationText !== credential.identifier) {
      form.setError("confirmationText", {
        message:
          "The identifier doesn't match. Please type it exactly as shown.",
      })
      return
    }

    try {
      await deleteCredentialMutation.mutateAsync({
        id: credential.id,
      })

      toast("The credential has been deleted successfully.", "success")
      onOpenChange(false)
      form.reset()

      if (shouldRedirect) {
        router.push("/dashboard/accounts")
      }
    } catch (error) {
      console.log(error)
      toast("Failed to delete credential. Please try again later.", "error")
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icons.trash className="text-destructive size-5" />
            Delete Credential
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p className="text-foreground">
              Are you sure you want to delete the following credential? This
              action cannot be undone.
            </p>
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
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleDelete)}
            className="space-y-4 pt-3"
          >
            <FormField
              control={form.control}
              name="confirmationText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    To verify, type{" "}
                    <span className="text-foreground font-semibold">
                      {credential.identifier}
                    </span>
                    below:
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={`Type "${credential.identifier}" here`}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel
            disabled={isDeleting}
            className="order-2 sm:order-1"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={form.handleSubmit(handleDelete)}
            disabled={!isConfirmationValid || isDeleting}
            variant="destructive"
            className="order-1 disabled:opacity-50 sm:order-2"
          >
            {isDeleting && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            Delete Credential
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
