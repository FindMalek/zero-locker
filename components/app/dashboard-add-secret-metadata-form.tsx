"use client"

import { SecretDto } from "@/schemas/secret"
import { SecretStatus } from "@prisma/client"
import { useForm } from "react-hook-form"

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

interface SecretMetadataFormProps {
  form: ReturnType<typeof useForm<SecretDto>>
}

const SECRET_STATUSES = [
  { value: SecretStatus.ACTIVE, label: "Active" },
  { value: SecretStatus.EXPIRED, label: "Expired" },
  { value: SecretStatus.REVOKED, label: "Revoked" },
]

export function DashboardAddSecretMetadataForm({
  form,
}: SecretMetadataFormProps) {
  return (
    <div className="space-y-4">
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
                    field.onChange(e.target.value ? new Date(e.target.value) : undefined)
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                The current status of this secret
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
} 