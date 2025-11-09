"use client"

import { useEffect, useState } from "react"
import { useCurrentUser, useUpdateProfile } from "@/orpc/hooks/use-users"
import { updateProfileInputSchema } from "@/schemas/user"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { handleErrors } from "@/lib/utils"

import { AccountField } from "@/components/shared/account-field"
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

interface AccountNameFieldProps {
  initialName: string
}

export function AccountNameField({ initialName }: AccountNameFieldProps) {
  const { data: user } = useCurrentUser()
  const currentName = user?.name ?? initialName
  const updateProfileMutation = useUpdateProfile()
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<z.infer<typeof updateProfileInputSchema>>({
    resolver: zodResolver(updateProfileInputSchema),
    defaultValues: {
      name: currentName,
    },
  })

  // Update form when user data changes
  useEffect(() => {
    if (user?.name && form.getValues("name") !== user.name) {
      form.reset({ name: user.name })
    }
  }, [user?.name, form])

  const onSubmit = async (data: z.infer<typeof updateProfileInputSchema>) => {
    try {
      await updateProfileMutation.mutateAsync(data)
      toast.success("Profile updated successfully")
      setIsEditing(false)
    } catch (error) {
      const { message } = handleErrors(error, "Failed to update profile. Please try again.")
      toast.error(message)
    }
  }

  if (isEditing) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    variant="editable"
                    autoFocus
                    isSaving={
                      form.formState.isSubmitting ||
                      updateProfileMutation.isPending
                    }
                    onSave={form.handleSubmit(onSubmit)}
                    onCancel={() => {
                      setIsEditing(false)
                      form.reset()
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    )
  }

  return (
    <AccountField
      label="Full name"
      value={currentName}
      action={
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
          Update
        </Button>
      }
    />
  )
}
