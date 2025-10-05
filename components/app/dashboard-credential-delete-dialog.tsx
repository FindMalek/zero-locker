"use client"

import { useRouter } from "next/navigation"
import { useDeleteCredential } from "@/orpc/hooks/use-credentials"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
  credentialId: string
  credentialIdentifier: string
  shouldRedirect?: boolean
}

// Needs a complete redesign of UI
export function DashboardDeleteCredentialDialog({
  open,
  onOpenChange,
  credentialId,
  credentialIdentifier,
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
  const isConfirmationValid = confirmationText === credentialIdentifier

  // Don't render if we don't have valid credential data
  if (!credentialId || !credentialIdentifier) {
    return null
  }

  const handleDelete = async (data: DeleteCredentialFormData) => {
    if (data.confirmationText !== credentialIdentifier) {
      form.setError("confirmationText", {
        message:
          "The identifier doesn't match. Please type it exactly as shown.",
      })
      return
    }

    try {
      await deleteCredentialMutation.mutateAsync({
        id: credentialId,
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
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete the following credential? This
              action cannot be undone.
            </p>
            <div className="bg-muted/50 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Icons.user className="text-muted-foreground size-4" />
                <span className="font-medium">{credentialIdentifier}</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Deleting this credential will remove all associated data including
              passwords, metadata, and access logs.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleDelete)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="confirmationText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    To verify, type{" "}
                    <span className="text-foreground font-mono">
                      {credentialIdentifier}
                    </span>{" "}
                    below:
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={`Type "${credentialIdentifier}" here`}
                      className={`transition-colors ${
                        field.value && !isConfirmationValid
                          ? "border-destructive focus-visible:ring-destructive"
                          : field.value && isConfirmationValid
                            ? "border-green-500 focus-visible:ring-green-500"
                            : ""
                      }`}
                      autoComplete="off"
                    />
                  </FormControl>
                  {field.value && !isConfirmationValid && (
                    <p className="text-destructive text-sm">
                      The text doesn&apos;t match. Please type it exactly as
                      shown.
                    </p>
                  )}
                  {field.value && isConfirmationValid && (
                    <p className="flex items-center gap-1 text-sm text-green-600">
                      <Icons.check className="size-3" />
                      Confirmation text matches
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <AlertDialogFooter className="gap-2 sm:gap-0">
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
