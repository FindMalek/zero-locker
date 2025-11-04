"use client"

import { useState } from "react"
import { useCurrentUser } from "@/orpc/hooks/use-users"
import {
  updateEmailInputSchema,
  updatePasswordInputSchema,
  updateProfileInputSchema,
} from "@/schemas/user"
import type { UserSimpleOutput } from "@/schemas/user/user"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { AccountPageHeader } from "@/components/app/account-page-header"
import { AccountSectionHeader } from "@/components/app/account-section-header"
import { AccountField } from "@/components/shared/account-field"
import { Icons } from "@/components/shared/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

interface AccountGeneralClientProps {
  initialUser: UserSimpleOutput
}

export function AccountGeneralClient({
  initialUser,
}: AccountGeneralClientProps) {
  const { data: user } = useCurrentUser()
  const currentUser = user ?? initialUser

  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)

  const profileForm = useForm<z.infer<typeof updateProfileInputSchema>>({
    resolver: zodResolver(updateProfileInputSchema),
    defaultValues: {
      name: currentUser.name,
    },
  })

  const emailForm = useForm<z.infer<typeof updateEmailInputSchema>>({
    resolver: zodResolver(updateEmailInputSchema),
    defaultValues: {
      email: currentUser.email,
    },
  })

  const passwordForm = useForm<z.infer<typeof updatePasswordInputSchema>>({
    resolver: zodResolver(updatePasswordInputSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onProfileSubmit = async (
    data: z.infer<typeof updateProfileInputSchema>
  ) => {
    try {
      // TODO: Implement update user endpoint
      toast.success("Profile updated successfully")
      setIsEditingName(false)
    } catch (error) {
      toast.error("Failed to update profile")
    }
  }

  const onEmailSubmit = async (
    data: z.infer<typeof updateEmailInputSchema>
  ) => {
    try {
      // TODO: Implement update email endpoint
      toast.success("Email update request sent. Please check your email.")
      setIsEditingEmail(false)
    } catch (error) {
      toast.error("Failed to update email")
    }
  }

  const onPasswordSubmit = async (
    data: z.infer<typeof updatePasswordInputSchema>
  ) => {
    try {
      // TODO: Implement password update endpoint
      toast.success("Password updated successfully")
      setIsEditingPassword(false)
      passwordForm.reset()
    } catch (error) {
      toast.error("Failed to update password")
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-8">
      <AccountPageHeader
        title="General Settings"
        description="Manage your account settings and personal information"
      />

      {/* Profile Section */}
      <div className="space-y-6">
        <AccountSectionHeader
          title="Profile"
          description="This information will be displayed publicly so be careful what you share."
        />

        <div className="space-y-6">
          {/* Profile Picture */}
          <AccountField
            label="Profile Picture"
            value={
              <div className="flex items-center gap-4">
                <Avatar className="size-12 sm:size-16">
                  <AvatarImage
                    src={currentUser.image ?? undefined}
                    alt={currentUser.name}
                  />
                  <AvatarFallback>
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            }
            action={
              <Button variant="outline" size="sm" type="button">
                Change
              </Button>
            }
          />

          {/* Full Name */}
          {isEditingName ? (
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full sm:max-w-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setIsEditingName(false)
                              profileForm.reset()
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={profileForm.formState.isSubmitting}
                  >
                    {profileForm.formState.isSubmitting && (
                      <Icons.spinner className="mr-2 size-4 animate-spin" />
                    )}
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingName(false)
                      profileForm.reset()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <AccountField
              label="Full name"
              value={currentUser.name}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingName(true)}
                >
                  Update
                </Button>
              }
            />
          )}

          {/* Email Address */}
          {isEditingEmail ? (
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          className="w-full sm:max-w-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setIsEditingEmail(false)
                              emailForm.reset()
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={emailForm.formState.isSubmitting}
                  >
                    {emailForm.formState.isSubmitting && (
                      <Icons.spinner className="mr-2 size-4 animate-spin" />
                    )}
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingEmail(false)
                      emailForm.reset()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <AccountField
              label="Email address"
              value={currentUser.email}
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingEmail(true)}
                >
                  Update
                </Button>
              }
            />
          )}

          {/* Password */}
          {isEditingPassword ? (
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          className="w-full sm:max-w-sm"
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          className="w-full sm:max-w-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          className="w-full sm:max-w-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={passwordForm.formState.isSubmitting}
                  >
                    {passwordForm.formState.isSubmitting && (
                      <Icons.spinner className="mr-2 size-4 animate-spin" />
                    )}
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingPassword(false)
                      passwordForm.reset()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <AccountField
              label="Password"
              value="••••••••••••••••"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingPassword(true)}
                >
                  Update
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}
