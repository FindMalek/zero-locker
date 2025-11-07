"use client"

import { useState } from "react"
import { useChangePassword } from "@/orpc/hooks/use-users"
import { updatePasswordInputSchema } from "@/schemas/user"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { AccountField } from "@/components/shared/account-field"
import { Icons } from "@/components/shared/icons"
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

export function AccountPasswordField() {
  const changePasswordMutation = useChangePassword()
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<z.infer<typeof updatePasswordInputSchema>>({
    resolver: zodResolver(updatePasswordInputSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof updatePasswordInputSchema>) => {
    try {
      const result = await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })

      if (result.success) {
        toast.success(result.message || "Password updated successfully")
        setIsEditing(false)
        form.reset()
      } else {
        toast.error(result.message || "Failed to update password")
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update password. Please try again."
      toast.error(errorMessage)
    }
  }

  if (isEditing) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    variant="password"
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" variant="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" variant="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center gap-2 py-4">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => {
                setIsEditing(false)
                form.reset()
              }}
              disabled={
                form.formState.isSubmitting || changePasswordMutation.isPending
              }
              className="size-8 flex-shrink-0"
              aria-label="Cancel"
            >
              <Icons.close className="size-4" />
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={
                form.formState.isSubmitting || changePasswordMutation.isPending
              }
              className="flex-1"
            >
              {(form.formState.isSubmitting ||
                changePasswordMutation.isPending) && (
                <Icons.spinner className="mr-2 size-4 animate-spin" />
              )}
              Save
            </Button>
          </div>
        </form>
      </Form>
    )
  }

  return (
    <AccountField
      label="Password"
      value="••••••••••••••••"
      action={
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
          Update
        </Button>
      }
    />
  )
}
