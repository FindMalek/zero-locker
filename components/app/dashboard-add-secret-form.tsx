"use client"

import { SecretDto } from "@/schemas/secret"
import { SecretType } from "@prisma/client"
import { useForm } from "react-hook-form"

import { getLogoDevUrlWithToken, getPlaceholderImage } from "@/lib/utils"

import { Icons } from "@/components/shared/icons"
import { PasswordStrengthMeter } from "@/components/shared/password-strength-meter"
import { Button } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SecretFormProps {
  form: ReturnType<typeof useForm<SecretDto>>
  platforms: Array<{ id: string; name: string; logo?: string | null }>
  secretStrength: { score: number; feedback: string } | null
  onSecretChange: (secret: string) => void
  onGenerateSecret: () => void
  onCopySecret: () => void
  isCopied: boolean
}

const SECRET_TYPES = [
  { value: SecretType.API_KEY, label: "API Key" },
  { value: SecretType.ENV_VARIABLE, label: "Environment Variable" },
  { value: SecretType.DATABASE_URL, label: "Database URL" },
  { value: SecretType.CLOUD_STORAGE_KEY, label: "Cloud Storage Key" },
  { value: SecretType.THIRD_PARTY_API_KEY, label: "Third-party API Key" },
]

export function DashboardAddSecretForm({
  form,
  platforms,
  secretStrength,
  onSecretChange,
  onGenerateSecret,
  onCopySecret,
  isCopied,
}: SecretFormProps) {
  return (
    <div className="space-y-6">
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

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Secret Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g., GitHub API Token" />
            </FormControl>
            <FormDescription>
              A name to identify this secret
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="value"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Secret Value</FormLabel>
            <div className="flex w-full gap-2">
              <FormControl className="min-w-0 flex-1">
                <Input
                  variant="password"
                  className="w-full"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    onSecretChange(e.target.value)
                  }}
                  placeholder="Enter or generate a secure secret"
                />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onGenerateSecret}
                title="Generate secure secret"
              >
                <Icons.refresh className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onCopySecret}
                title="Copy secret"
              >
                {isCopied ? (
                  <Icons.check className="text-success h-4 w-4" />
                ) : (
                  <Icons.copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {secretStrength && (
              <div className="mt-2 space-y-2">
                <PasswordStrengthMeter score={secretStrength.score} />
                <div className="text-muted-foreground text-sm">
                  {secretStrength.feedback}
                </div>
              </div>
            )}
            <FormDescription>
              Your secret value. Use the generate button for a strong secret.
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
    </div>
  )
} 