"use client"

import { CredentialMetadataDto } from "@/schemas/credential"
import { useForm } from "react-hook-form"

import { Checkbox } from "@/components/ui/checkbox"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface MetadataFormProps {
  form: ReturnType<typeof useForm<CredentialMetadataDto>>
}

export function DashboardAddCredentialMetadataForm({
  form,
}: MetadataFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="recoveryEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recovery Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  {...field}
                  placeholder="recovery@example.com"
                />
              </FormControl>
              <FormDescription>
                Email address for account recovery
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input type="tel" {...field} placeholder="+1 (555) 123-4567" />
              </FormControl>
              <FormDescription>
                Phone number for account verification
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="has2FA"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Two-Factor Authentication</FormLabel>
              <FormDescription>
                This account has 2FA enabled (SMS, authenticator app, etc.)
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="otherInfo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Notes</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Security questions, backup codes, etc."
              />
            </FormControl>
            <FormDescription>
              Any other important information about this credential
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
