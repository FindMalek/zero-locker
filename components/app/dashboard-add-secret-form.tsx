"use client"

import { useCallback, useEffect, useState } from "react"
import { SecretDto } from "@/schemas/secrets/secrets"
import { SecretStatus, SecretType } from "@prisma/client"
import { useForm } from "react-hook-form"

import {
  cn,
  getLogoDevUrlWithToken,
  getMetadataLabels,
  getPlaceholderImage,
} from "@/lib/utils"

import { Icons } from "@/components/shared/icons"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ComboboxResponsive } from "@/components/ui/combobox-responsive"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SECRET_TYPES = [
  { value: SecretType.API_KEY, label: "API Key" },
  { value: SecretType.ENV_VARIABLE, label: "Environment Variable" },
  { value: SecretType.DATABASE_URL, label: "Database URL" },
  { value: SecretType.CLOUD_STORAGE_KEY, label: "Cloud Storage Key" },
  { value: SecretType.THIRD_PARTY_API_KEY, label: "Third-party API Key" },
]

const SECRET_STATUSES = [
  { value: SecretStatus.ACTIVE, label: "Active" },
  { value: SecretStatus.EXPIRED, label: "Expired" },
  { value: SecretStatus.REVOKED, label: "Revoked" },
]

interface SecretKeyValue {
  key: string
  value: string
  id: string
}

interface SecretFormProps {
  form: ReturnType<typeof useForm<SecretDto>>
  platforms: Array<{ id: string; name: string; logo?: string | null }>
  title?: string
  onTitleChange?: (title: string) => void
}

export function DashboardAddSecretForm({
  form,
  platforms,
  title = "",
  onTitleChange,
}: SecretFormProps) {
  const [showMetadata, setShowMetadata] = useState(false)
  const [keyValuePairs, setKeyValuePairs] = useState<SecretKeyValue[]>([
    { id: "1", key: "", value: "" },
  ])

  const generateId = () => Math.random().toString(36).substring(2, 11)

  const parseEnvLine = useCallback(
    (envContent: string): { key: string; value: string } | null => {
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
    },
    []
  )

  const parseMultipleEnvLines = useCallback(
    (envContent: string): SecretKeyValue[] => {
      const lines = envContent.split("\n")
      const pairs: SecretKeyValue[] = []

      lines.forEach((line) => {
        const parsed = parseEnvLine(line)
        if (parsed) {
          pairs.push({
            id: generateId(),
            key: parsed.key,
            value: parsed.value,
          })
        }
      })

      return pairs.length > 0
        ? pairs
        : [{ id: generateId(), key: "", value: "" }]
    },
    [parseEnvLine]
  )

  const addKeyValuePair = useCallback(() => {
    setKeyValuePairs((prev) => [
      ...prev,
      { id: generateId(), key: "", value: "" },
    ])
  }, [])

  const removeKeyValuePair = useCallback(
    (id: string) => {
      if (keyValuePairs.length > 1) {
        setKeyValuePairs((prev) => prev.filter((pair) => pair.id !== id))
      }
    },
    [keyValuePairs.length]
  )

  const updateKeyValuePair = useCallback(
    (id: string, field: "key" | "value", newValue: string) => {
      setKeyValuePairs((prev) =>
        prev.map((pair) =>
          pair.id === id ? { ...pair, [field]: newValue } : pair
        )
      )
    },
    []
  )

  const handlePaste = useCallback(
    (id: string, field: "key" | "value", pastedText: string) => {
      // Check if pasting multiple lines (env file format)
      if (
        pastedText.includes("\n") ||
        (pastedText.includes("=") && field === "key")
      ) {
        const parsed = parseMultipleEnvLines(pastedText)
        setKeyValuePairs(parsed)
        return
      }

      // Normal single value paste
      updateKeyValuePair(id, field, pastedText)
    },
    [updateKeyValuePair, parseMultipleEnvLines]
  )

  // Update form values when keyValuePairs change
  useEffect(() => {
    if (keyValuePairs.length > 0) {
      // Use the first key as the name
      const firstName = keyValuePairs[0]?.key || ""
      const currentName = form.getValues("name")

      if (currentName !== firstName) {
        form.setValue("name", firstName)
      }

      // Create formatted value
      let formattedValue = ""
      if (keyValuePairs.length === 1) {
        formattedValue = keyValuePairs[0]?.value || ""
      } else {
        formattedValue = keyValuePairs
          .filter((pair) => pair.key.trim() && pair.value.trim())
          .map((pair) => `${pair.key}=${pair.value}`)
          .join("\n")
      }

      const currentValue = form.getValues("value")
      if (currentValue !== formattedValue) {
        form.setValue("value", formattedValue)
      }
    }
  }, [keyValuePairs, form])

  // Initialize from form values if they exist (only on mount)
  useEffect(() => {
    const currentName = form.getValues("name")
    const currentValue = form.getValues("value")

    if (
      (currentName || currentValue) &&
      keyValuePairs.length === 1 &&
      !keyValuePairs[0].key &&
      !keyValuePairs[0].value
    ) {
      if (currentValue.includes("\n") || currentValue.includes("=")) {
        const parsed = parseMultipleEnvLines(`${currentName}=${currentValue}`)
        setKeyValuePairs(parsed)
      } else if (currentName || currentValue) {
        setKeyValuePairs([
          { id: generateId(), key: currentName, value: currentValue },
        ])
      }
    }
  }, [form, keyValuePairs, parseMultipleEnvLines])

  const hasMetadataValues = () => {
    const values = form.getValues()
    return !!(
      values.expiresAt ||
      values.status !== SecretStatus.ACTIVE ||
      values.platformId ||
      values.type !== SecretType.ENV_VARIABLE ||
      values.description
    )
  }

  const getMetadataLabelsForSecret = () => {
    const values = form.getValues()
    const fieldMappings: Record<string, string> = {}

    if (values.expiresAt) {
      fieldMappings.expiresAt = "Expires"
    }

    const platform = platforms.find((p) => p.id === values.platformId)
    if (platform) {
      fieldMappings.platformId = platform.name
    }

    const secretType = SECRET_TYPES.find((t) => t.value === values.type)
    if (secretType && values.type !== SecretType.ENV_VARIABLE) {
      fieldMappings.type = secretType.label
    }

    if (values.status !== SecretStatus.ACTIVE) {
      fieldMappings.status = "Status"
    }

    if (values.description) {
      fieldMappings.description = "Description"
    }

    return getMetadataLabels(values, fieldMappings)
  }

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Title
        </Label>
        <Input
          id="title"
          placeholder="e.g., Production API Keys, Development Environment"
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Secret Key-Value Section */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Secrets</Label>

        <div className="overflow-hidden rounded-lg border">
          <div className="space-y-0">
            {keyValuePairs.map((pair, index) => (
              <div
                key={pair.id}
                className={cn(
                  "flex items-start gap-2 p-3 sm:gap-3 sm:p-4",
                  index > 0 && "border-border border-t"
                )}
              >
                <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                  <div>
                    {index === 0 && (
                      <Label className="text-muted-foreground mb-2 block text-xs uppercase tracking-wide">
                        Key
                      </Label>
                    )}
                    <Input
                      placeholder="API_SECRET_KEY"
                      value={pair.key}
                      onChange={(e) =>
                        updateKeyValuePair(pair.id, "key", e.target.value)
                      }
                      onPaste={(e) => {
                        e.preventDefault()
                        const pastedText = e.clipboardData.getData("text")
                        handlePaste(pair.id, "key", pastedText)
                      }}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div>
                    {index === 0 && (
                      <Label className="text-muted-foreground mb-2 block text-xs uppercase tracking-wide">
                        Value
                      </Label>
                    )}
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="sk_test_abc123..."
                        value={pair.value}
                        onChange={(e) =>
                          updateKeyValuePair(pair.id, "value", e.target.value)
                        }
                        onPaste={(e) => {
                          e.preventDefault()
                          const pastedText = e.clipboardData.getData("text")
                          handlePaste(pair.id, "value", pastedText)
                        }}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                {keyValuePairs.length > 1 && (
                  <div className={cn("flex", index === 0 ? "pt-6" : "pt-0")}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeKeyValuePair(pair.id)}
                      title="Remove this key-value pair"
                      className="text-muted-foreground hover:text-destructive h-9 w-9 flex-shrink-0 p-0"
                    >
                      <Icons.close className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {/* Add Another Button */}
            <div className="border-border border-t p-3 sm:p-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addKeyValuePair}
                className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2"
              >
                <Icons.add className="h-4 w-4" />
                Add Another
              </Button>
            </div>
          </div>
        </div>

        <Alert variant="default">
          <AlertDescription className="flex flex-wrap items-center">
            💡 Pro tip: Paste multiple environment variables or{" "}
            <code className="bg-muted-foreground/20 mx-1 whitespace-nowrap rounded px-1">
              KEY=value
            </code>{" "}
            format into any field to auto-populate multiple rows.
          </AlertDescription>
        </Alert>
      </div>

      {/* Metadata Section */}
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
                <span className="font-medium">Additional Information</span>
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
          <div className="bg-muted/55 space-y-4 p-4">
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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
                      The type of secret you&apos;re storing
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

            {/* Expiry Date and Status */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={
                          field.value
                            ? new Date(field.value).toISOString().slice(0, 16)
                            : ""
                        }
                        onChange={(e) => {
                          field.onChange(
                            e.target.value
                              ? new Date(e.target.value)
                              : undefined
                          )
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      When this secret expires (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SECRET_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Current status of this secret
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
