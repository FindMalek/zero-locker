"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Copy, RefreshCw } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"
import { checkPasswordStrength, generatePassword } from "@/lib/password"

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
import { Switch } from "@/components/ui/switch"

// Define the form schema
const accountFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  loginUrl: z.string().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "DELETED"]),
  platformId: z.string().min(1, "Platform is required"),
})

// Define the form values type
type AccountFormValues = z.infer<typeof accountFormSchema>

// Define the credential data type that will be sent to the server
// interface CredentialData extends Omit<AccountFormValues, "tags"> {
//   password: string
//   encryptionKey: string
//   iv: string
//   tags: string[]
// }

interface AddAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DashboardAddAccountDialog({
  open,
  onOpenChange,
}: AddAccountDialogProps) {
  const [createMore, setCreateMore] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    feedback: string
  } | null>(null)

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      loginUrl: "",
      description: "",
      tags: "",
      status: "ACTIVE" as const,
      platformId: "",
    },
  })

  const handleGeneratePassword = () => {
    const newPassword = generatePassword(16)
    form.setValue("password", newPassword)
    setPasswordStrength(checkPasswordStrength(newPassword))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  async function onSubmit(values: AccountFormValues) {
    try {
      // Generate encryption key
      // const key = await generateEncryptionKey()

      // // Encrypt the password
      // const { encryptedData, iv } = await encryptData(values.password, key)

      // // Export the key for storage
      // const keyString = await exportKey(key)

      // const tagsArray = values.tags
      //   ? values.tags.split(",").map((tag) => tag.trim())
      //   : []

      // onSave({
      //   ...values,
      //   password: encryptedData,
      //   encryptionKey: keyString,
      //   iv,
      //   tags: tagsArray,
      // })

      if (!createMore) {
        form.reset()
        setPasswordStrength(null)
      }
    } catch (error) {
      console.error("Error encrypting password:", error)
      // Handle error appropriately
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

  // Add password strength indicator
  const getPasswordStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return "text-red-500"
      case 2:
        return "text-orange-500"
      case 3:
        return "text-yellow-500"
      case 4:
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogDescription>
            Add a new account to your vault. All information is securely stored.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    A name to identify this account.
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
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(form.getValues("password"))
                      }
                      title="Copy password"
                    >
                      <Copy className="h-4 w-4" />
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
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Comma-separated tags to categorize this account.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                Create another account after saving
              </label>
            </div>

            <Button type="submit">Save Account</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
