"use client"

import { useEffect, useState } from "react"
import { CredentialSchemaDto, type CredentialDto } from "@/schemas/credential"
import { PlatformSimpleRo } from "@/schemas/platform"
import { zodResolver } from "@hookform/resolvers/zod"
import { AccountStatus } from "@prisma/client"
import { useForm } from "react-hook-form"

import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"
import { checkPasswordStrength, generatePassword } from "@/lib/password"
import { handleErrors } from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { useToast } from "@/hooks/use-toast"

import { Icons } from "@/components/shared/icons"
import { PasswordStrengthMeter } from "@/components/shared/password-strength-meter"
import { Button } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import { createCredential } from "@/actions/credential"
import { listPlatforms } from "@/actions/platform"

interface CredentialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DashboardAddCredentialDialog({
  open,
  onOpenChange,
}: CredentialDialogProps) {
  const [createMore, setCreateMore] = useState(false)
  const [platforms, setPlatforms] = useState<PlatformSimpleRo[]>([])
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    feedback: string
  } | null>(null)

  const { copy, isCopied } = useCopyToClipboard({
    successDuration: 1500,
  })

  const { toast, toastPromise, toastLoading, dismiss, dismissAll } = useToast()

  const form = useForm<CredentialDto>({
    resolver: zodResolver(CredentialSchemaDto) as any,
    defaultValues: {
      username: "",
      password: "",
      loginUrl: "",
      description: "",
      status: AccountStatus.ACTIVE,
      platformId: "",
      containerId: "",
      encryptionKey: "",
      iv: "",
    },
  })

  useEffect(() => {
    const fetchPlatforms = async () => {
      const result = await listPlatforms(1, 100)
      if (result.success && result.platforms) {
        setPlatforms(result.platforms)
      }
    }
    fetchPlatforms()
  }, [])

  const handleGeneratePassword = () => {
    const newPassword = generatePassword(16)
    form.setValue("password", newPassword)
    setPasswordStrength(checkPasswordStrength(newPassword))
  }

  async function onSubmit(values: CredentialDto) {
    try {
      // Show loading toast
      const loadingToast = toastLoading("Saving credential...")

      // Generate encryption data
      let keyString = ""
      let encryptedData = ""
      let ivString = ""

      try {
        const key = await generateEncryptionKey()
        const encryptResult = await encryptData(values.password, key)
        encryptedData = encryptResult.encryptedData
        ivString = encryptResult.iv
        keyString = await exportKey(key)
      } catch (error: unknown) {
        console.error("Encryption error:", error)
        // Dismiss loading toast before showing error
        dismiss(loadingToast.id)

        // Handle encryption errors and show toast
        const { message, details } = handleErrors(error, "Encryption failed")
        toast(
          details
            ? `${message}: ${Array.isArray(details) ? details.join(", ") : details}`
            : message,
          "error"
        )
        return // Stop form submission
      }

      // Send the credential with all required encryption data
      const credentialToSave: CredentialDto = {
        ...values,
        password: encryptedData,
        encryptionKey: keyString,
        iv: ivString,
      }

      // Save credential to database
      const result = await createCredential(credentialToSave)

      // Dismiss loading toast
      dismiss(loadingToast.id)

      if (result.success) {
        // Show success toast
        toast("Credential saved successfully", "success")

        if (!createMore) {
          handleDialogOpenChange(false)
        } else {
          form.reset({
            username: "",
            password: "",
            loginUrl: "",
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
        // Handle errors
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
    } catch (error) {
      // Dismiss all toasts before showing error
      dismissAll()

      // Handle unexpected errors
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {platforms.map((platform) => (
                            <SelectItem key={platform.id} value={platform.id}>
                              {platform.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the platform for this credential.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
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
                            type="password"
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
                          <PasswordStrengthMeter
                            score={passwordStrength.score}
                          />
                          <div className="text-muted-foreground text-sm">
                            {passwordStrength.feedback}
                          </div>
                        </div>
                      )}
                      <FormDescription>
                        Your secure password. Use the generate button for a
                        strong password.
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
                  name="loginUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Login URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        The URL where you can log in to this account.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                <FormField
                  control={form.control}
                  name="containerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Container ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional container ID for organizing credentials.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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

            <Button type="submit">Save Credential</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
