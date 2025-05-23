"use client"

import { useEffect, useState } from "react"
import { CredentialSchemaDto, type CredentialDto } from "@/schemas/credential"
import { zodResolver } from "@hookform/resolvers/zod"
import { AccountStatus } from "@prisma/client"
import { useForm } from "react-hook-form"

import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"
import { checkPasswordStrength, generatePassword } from "@/lib/password"
import { handleErrors } from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { usePlatforms } from "@/hooks/use-platforms"
import { useToast } from "@/hooks/use-toast"

import { Icons } from "@/components/shared/icons"
import { PasswordStrengthMeter } from "@/components/shared/password-strength-meter"
import { Button } from "@/components/ui/button"
import { ComboboxResponsive } from "@/components/ui/combobox-responsive"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

import { createCredential } from "@/actions/credential"

interface CredentialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DashboardAddCredentialDialog({
  open,
  onOpenChange,
}: CredentialDialogProps) {
  const [createMore, setCreateMore] = useState(false)
  const { platforms, error: platformsError } = usePlatforms()
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    feedback: string
  } | null>(null)

  const { copy, isCopied } = useCopyToClipboard({
    successDuration: 1500,
  })

  const { toast, toastLoading, dismiss, dismissAll } = useToast()

  const form = useForm<CredentialDto>({
    resolver: zodResolver(CredentialSchemaDto) as any,
    defaultValues: {
      username: "",
      password: "",
      description: "",
      status: AccountStatus.ACTIVE,
      platformId: "",
      containerId: "",
      encryptionKey: "",
      iv: "",
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (platformsError) {
      toast(platformsError, "error")
    }
  }, [platformsError, toast])

  const handleGeneratePassword = () => {
    const newPassword = generatePassword(16)
    form.setValue("password", newPassword)
    setPasswordStrength(checkPasswordStrength(newPassword))
  }

  async function onSubmit(values: CredentialDto) {
    try {
      setIsSubmitting(true)
      const loadingToast = toastLoading("Saving credential...")

      try {
        const key = await generateEncryptionKey()
        const encryptResult = await encryptData(values.password, key)
        const keyString = await exportKey(key)

        const credentialToSave: CredentialDto = {
          ...values,
          password: encryptResult.encryptedData,
          encryptionKey: keyString,
          iv: encryptResult.iv,
        }

        const result = await createCredential(credentialToSave)

        dismiss(loadingToast.id)

        if (result.success) {
          toast("Credential saved successfully", "success")

          if (!createMore) {
            handleDialogOpenChange(false)
          } else {
            form.reset({
              username: "",
              password: "",
              description: "",
              status: AccountStatus.ACTIVE,
              platformId: values.platformId,
              containerId: values.containerId,
              encryptionKey: "",
              iv: "",
            })
            setPasswordStrength(null)
          }
        } else {
          const errorDetails = result.issues
            ? result.issues
              .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
              .join(", ")
            : result.error

          toast(
            `Failed to save credential: ${errorDetails || "Unknown error"}`,
            "error"
          )
        }
      } catch (error: unknown) {
        console.error("Encryption error:", error)
        dismiss(loadingToast.id)

        const { message, details } = handleErrors(error, "Encryption failed")
        toast(
          details
            ? `${message}: ${Array.isArray(details) ? details.join(", ") : details}`
            : message,
          "error"
        )
        return
      }
    } catch (error) {
      dismissAll()

      const { message, details } = handleErrors(
        error,
        "Failed to save credential"
      )
      toast(
        details
          ? `${message}: ${Array.isArray(details) ? details.join(", ") : details}`
          : message,
        "error"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
      setCreateMore(false)
      setPasswordStrength(null)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Add New Credential</DialogTitle>
          <DialogDescription>
            Add a new credential to your vault. All information is securely
            stored.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Left column - Important fields */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="platformId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <FormControl>
                        <ComboboxResponsive
                          items={platforms.map((platform) => ({
                            value: platform.id,
                            label: platform.name,
                          }))}
                          selectedItem={
                            platforms.find((p) => p.id === field.value)
                              ? {
                                value: field.value,
                                label:
                                  platforms.find((p) => p.id === field.value)
                                    ?.name || "",
                              }
                              : null
                          }
                          onSelect={(item) => field.onChange(item?.value || "")}
                          placeholder="Select a platform"
                          searchPlaceholder="Search platforms..."
                          emptyText="No platforms found."
                        />
                      </FormControl>
                      <FormDescription>
                        Select the platform for this credential.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />


              </div>

              {/* Right column - Optional fields */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Additional information about this account.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem
                >
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Your username or email for this account.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="flex w-full gap-2">
                    <FormControl className="min-w-0 flex-1">
                      <Input
                        variant="password"
                        className="w-full"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          setPasswordStrength(
                            checkPasswordStrength(e.target.value)
                          )
                        }}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleGeneratePassword}
                      title="Generate secure password"
                    >
                      <Icons.refresh className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => copy(form.getValues("password"))}
                      title="Copy password"
                    >
                      {isCopied ? (
                        <Icons.check className="text-success h-4 w-4" />
                      ) : (
                        <Icons.copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {passwordStrength && (
                    <div className="mt-2 space-y-2">
                      <PasswordStrengthMeter score={passwordStrength.score} />
                      <div className="text-muted-foreground text-sm">
                        {passwordStrength.feedback}
                      </div>
                    </div>
                  )}
                  <FormDescription>
                    Your secure password. Use the generate button for a strong
                    password.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4 flex items-center justify-between border-t pt-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="create-more"
                  checked={createMore}
                  onCheckedChange={setCreateMore}
                />
                <label
                  htmlFor="create-more"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Create another credential after saving
                </label>
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Credential
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
