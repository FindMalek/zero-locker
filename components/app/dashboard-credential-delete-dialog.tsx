"use client"

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
}

export function DashboardDeleteCredentialDialog({
  open,
  onOpenChange,
  credentialId,
  credentialIdentifier,
}: DeleteCredentialDialogProps) {
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Credential</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &apos;
            <strong>{credentialIdentifier}</strong>&apos;? This action cannot be
            undone.
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
                  <FormLabel>
                    To confirm deletion, type the credential identifier:
                  </FormLabel>
                  <div className="text-muted-foreground bg-muted rounded px-2 py-1 font-mono text-sm">
                    {credentialIdentifier}
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Type the identifier above"
                      className={
                        !isConfirmationValid && field.value
                          ? "border-destructive"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            onClick={form.handleSubmit(handleDelete)}
            disabled={!isConfirmationValid || isDeleting}
            variant="destructive"
            className="disabled:opacity-50"
          >
            {isDeleting && (
              <Icons.spinner className="mr-2 size-4 animate-spin" />
            )}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
