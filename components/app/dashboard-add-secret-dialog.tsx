"use client"

import { useEffect, useState } from "react"
import { SecretDto } from "@/schemas/secret"
import { zodResolver } from "@hookform/resolvers/zod"
import { SecretStatus, SecretType } from "@prisma/client"
import { useForm } from "react-hook-form"
import { Key } from "lucide-react"

import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"
import { checkPasswordStrength, generatePassword } from "@/lib/password"
import { cn, getMetadataLabels, handleErrors } from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { usePlatforms } from "@/hooks/use-platforms"
import { useToast } from "@/hooks/use-toast"

import { DashboardAddSecretMetadataForm } from "@/components/app/dashboard-add-secret-metadata-form"
import { Icons } from "@/components/shared/icons"
import { PasswordStrengthMeter } from "@/components/shared/password-strength-meter"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ComboboxResponsive } from "@/components/ui/combobox-responsive"
import {
  Dialog,
  DialogContent,
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
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

import { createSecret } from "@/actions/secret"
import { getLogoDevUrlWithToken, getPlaceholderImage } from "@/lib/utils"

interface SecretDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SECRET_TYPES = [
  { value: SecretType.API_KEY, label: "API Key" },
  { value: SecretType.ENV_VARIABLE, label: "Environment Variable" },
  { value: SecretType.DATABASE_URL, label: "Database URL" },
  { value: SecretType.CLOUD_STORAGE_KEY, label: "Cloud Storage Key" },
  { value: SecretType.THIRD_PARTY_API_KEY, label: "Third-party API Key" },
]

export function DashboardAddSecretDialog({
  open,
  onOpenChange,
}: SecretDialogProps) {
  const { toast } = useToast()
  const { platforms, error: platformsError } = usePlatforms()

  const [createMore, setCreateMore] = useState(false)
  const [showMetadata, setShowMetadata] = useState(false)
  const [secretStrength, setSecretStrength] = useState<{
    score: number
    feedback: string
  } | null>(null)
  const [title, setTitle] = useState("")

  const { copy, isCopied } = useCopyToClipboard({
    successDuration: 1500,
  })

  const form = useForm<SecretDto>({
    resolver: zodResolver(SecretDto),
    defaultValues: {
      name: "",
      value: "",
      description: "",
      type: SecretType.ENV_VARIABLE,
      status: SecretStatus.ACTIVE,
      expiresAt: undefined,
      platformId: "",
      containerId: "",
      encryptionKey: "",
      iv: "",
      userId: "",
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (platformsError) {
      toast(platformsError, "error")
    }
  }, [platformsError, toast])

  const handleGenerateSecret = () => {
    const newSecret = generatePassword(32) // Longer for secrets
    form.setValue("value", newSecret)
    setSecretStrength(checkPasswordStrength(newSecret))
  }

  const handleSecretChange = (secret: string) => {
    setSecretStrength(checkPasswordStrength(secret))
  }

  const handleCopySecret = () => {
    copy(form.getValues("value"))
  }

  const parseEnvLine = (envContent: string): { key: string; value: string } | null => {
    const trimmedLine = envContent.trim()

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      return null
    }

    // Check if line contains an equals sign
    if (trimmedLine.includes("=")) {
      const [key, ...valueParts] = trimmedLine.split("=")
      const value = valueParts.join("=").replace(/^["']|["']$/g, "") // Remove quotes if present

      if (key.trim()) {
        return {
          key: key.trim(),
          value: value.trim(),
        }
      }
    }

    return null
  }

  const handlePaste = (field: "name" | "value", pastedText: string) => {
    // Check if the pasted text contains an equals sign (single line)
    if (pastedText.includes("=") && field === "name") {
      const parsed = parseEnvLine(pastedText)
      if (parsed) {
        form.setValue("name", parsed.key)
        form.setValue("value", parsed.value)
        setSecretStrength(checkPasswordStrength(parsed.value))
        return
      }
    }

    // Normal paste behavior
    form.setValue(field, pastedText)
    if (field === "value") {
      setSecretStrength(checkPasswordStrength(pastedText))
    }
  }

  // Check if metadata form has any meaningful values
  const hasMetadataValues = () => {
    const values = form.getValues()
    return !!(
      values.expiresAt ||
      values.status !== SecretStatus.ACTIVE ||
      values.platformId ||
      values.type !== SecretType.ENV_VARIABLE
    )
  }

  // Get labels for metadata fields that have values
  const getMetadataLabelsForSecret = () => {
    const values = form.getValues()
    const fieldMappings: Record<string, string> = {}
    
    if (values.expiresAt) {
      fieldMappings.expiresAt = "Expires"
    }
    
    const platform = platforms.find(p => p.id === values.platformId)
    if (platform) {
      fieldMappings.platformId = platform.name
    }
    
    const secretType = SECRET_TYPES.find(t => t.value === values.type)
    if (secretType && values.type !== SecretType.ENV_VARIABLE) {
      fieldMappings.type = secretType.label
    }
    
    if (values.status !== SecretStatus.ACTIVE) {
      fieldMappings.status = "Status"
    }
    
    return getMetadataLabels(values, fieldMappings)
  }

  async function onSubmit() {
    try {
      setIsSubmitting(true)

      // Validate form
      const isValid = await form.trigger()
      if (!isValid) {
        toast("Please fill in all required fields", "error")
        return
      }

      const secretData = form.getValues()

      // Use title as description if no description provided
      if (title && !secretData.description) {
        secretData.description = title
      }

      // Encrypt secret value
      const key = await generateEncryptionKey()
      const encryptResult = await encryptData(secretData.value, key)
      const keyString = await exportKey(key)

      const secretDto: SecretDto = {
        name: secretData.name,
        value: encryptResult.encryptedData,
        description: secretData.description,
        type: secretData.type,
        status: secretData.status,
        expiresAt: secretData.expiresAt,
        encryptionKey: keyString,
        iv: encryptResult.iv,
        platformId: secretData.platformId,
        containerId: secretData.containerId,
        userId: secretData.userId,
      }

      const result = await createSecret(secretDto)

      if (result.success) {
        toast("Secret saved successfully", "success")

        if (!createMore) {
          handleDialogOpenChange(false)
        } else {
          form.reset({
            name: "",
            value: "",
            description: "",
            type: SecretType.ENV_VARIABLE,
            status: SecretStatus.ACTIVE,
            expiresAt: undefined,
            platformId: secretData.platformId,
            containerId: secretData.containerId,
            encryptionKey: "",
            iv: "",
            userId: "",
          })
          setTitle("")
          setSecretStrength(null)
          setShowMetadata(false)
        }
      } else {
        const errorDetails = result.issues
          ? result.issues
              .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
              .join(", ")
          : result.error

        toast(
          `Failed to save secret: ${errorDetails || "Unknown error"}`,
          "error"
        )
      }
    } catch (error) {
      const { message, details } = handleErrors(
        error,
        "Failed to save secret"
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
      setTitle("")
      setCreateMore(false)
      setShowMetadata(false)
      setSecretStrength(null)
    }
    onOpenChange(open)
  }

  const handleCancel = () => {
    handleDialogOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] sm:max-h-[90vh] p-0">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Key className="h-4 w-4 sm:h-5 sm:w-5" />
            Add Secret
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
          <div className="px-4 sm:px-6 py-4 space-y-6">
            <Form {...form}>
              <form
                id="secret-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  onSubmit()
                }}
                className="space-y-6"
              >
                {/* Title Section */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Production API Keys, Development Environment"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Secret Key-Value Section */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Secret</Label>

                  <div className="bg-gray-50 rounded-lg border overflow-hidden">
                    <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <Label className="text-xs text-gray-500 uppercase tracking-wide">Key</Label>
                              <FormControl>
                                <Input
                                  placeholder="API_SECRET_KEY"
                                  {...field}
                                  onPaste={(e) => {
                                    e.preventDefault()
                                    const pastedText = e.clipboardData.getData("text")
                                    handlePaste("name", pastedText)
                                  }}
                                  className="font-mono text-sm bg-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="value"
                          render={({ field }) => (
                            <FormItem>
                              <Label className="text-xs text-gray-500 uppercase tracking-wide">Value</Label>
                              <div className="flex gap-2">
                                <FormControl className="min-w-0 flex-1">
                                  <Input
                                    variant="password"
                                    placeholder="sk_test_abc123..."
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e)
                                      handleSecretChange(e.target.value)
                                    }}
                                    onPaste={(e) => {
                                      e.preventDefault()
                                      const pastedText = e.clipboardData.getData("text")
                                      handlePaste("value", pastedText)
                                    }}
                                    className="font-mono text-sm bg-white"
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleGenerateSecret}
                                  title="Generate secure secret"
                                  className="flex-shrink-0 h-9 w-9 p-0"
                                >
                                  <Icons.refresh className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCopySecret}
                                  title="Copy secret"
                                  className="flex-shrink-0 h-9 w-9 p-0"
                                >
                                  {isCopied ? (
                                    <Icons.check className="text-success h-4 w-4" />
                                  ) : (
                                    <Icons.copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {secretStrength && (
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
                        <PasswordStrengthMeter score={secretStrength.score} />
                        <div className="text-muted-foreground text-sm">
                          {secretStrength.feedback}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <strong>💡 Pro tip:</strong> Paste variables in the format{" "}
                    <code className="bg-blue-100 px-1 rounded">KEY=value</code> into the Key field to auto-populate both fields.
                  </div>
                </div>

                {/* Metadata Section */}
                <div className="space-y-4">
                  <Separator />

                  <Collapsible open={showMetadata} onOpenChange={setShowMetadata}>
                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        className={cn(
                          "hover:bg-muted/50 flex w-full items-center justify-between p-4",
                          showMetadata && "bg-muted/55"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Icons.add className="h-4 w-4" />
                            <span className="font-medium">
                              Additional Settings
                            </span>
                          </div>
                          {hasMetadataValues() && (
                            <Badge variant="secondary" className="text-xs">
                              {getMetadataLabelsForSecret()}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm">
                            {showMetadata ? "Hide" : "Optional"}
                          </span>
                          <Icons.chevronDown
                            className={`h-4 w-4 transition-transform ${
                              showMetadata ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="space-y-4">
                      <div className="bg-muted/55 p-4 space-y-4">
                        {/* Platform and Type */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                      logo: getPlaceholderImage(
                                        platform.name,
                                        getLogoDevUrlWithToken(platform.logo || null)
                                      ),
                                    }))}
                                    selectedItem={
                                      platforms.find((p) => p.id === field.value)
                                        ? {
                                            value: field.value,
                                            label:
                                              platforms.find((p) => p.id === field.value)?.name ||
                                              "",
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
                                  Choose the platform or service for this secret
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Secret Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select secret type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {SECRET_TYPES.map((type) => (
                                      <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  The type of secret you're storing
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Description */}
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="e.g., Used for API integrations..."
                                />
                              </FormControl>
                              <FormDescription>
                                Optional description to help identify this secret
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Existing metadata form */}
                        <DashboardAddSecretMetadataForm form={form} />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </form>
            </Form>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-end gap-3">
          <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateMore(!createMore)}
              className={cn(
                "flex items-center gap-2",
                createMore && "bg-primary/10 text-primary border-primary"
              )}
            >
              <Icons.add className="h-4 w-4" />
              {createMore ? "Creating More" : "Create More"}
            </Button>
            <Button 
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Saving..." : "Save Secret"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
