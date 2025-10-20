"use client"

import React from "react"
import type {
  CredentialFormInput,
  CredentialOutput,
} from "@/schemas/credential"
import { UseFormReturn } from "react-hook-form"

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

import { DashboardCredentialPasswordField } from "@/components/app/dashboard-credential-password-field"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CredentialFormProps {
  credential?: CredentialOutput
  form: UseFormReturn<CredentialFormInput>
  onPasswordChange?: (hasChanges: boolean) => void
}

export function CredentialForm({
  credential,
  form,
  onPasswordChange,
}: CredentialFormProps) {
  const { copy, isCopied } = useCopyToClipboard({ successDuration: 1000 })

  const { register, watch, setValue } = form
  const formData = watch()

  const handleCopy = async (text: string) => {
    await copy(text)
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Label className="text-foreground text-sm font-medium">
            Identifier
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Icons.helpCircle className="text-muted-foreground size-3" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                The username, email, or unique identifier for this credential
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="relative">
          <Input
            {...register("identifier")}
            className="border-border focus:border-ring focus:ring-ring pr-8 focus:ring-1"
            autoComplete="off"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hover:bg-muted absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => handleCopy(formData.identifier)}
          >
            {isCopied ? (
              <Icons.check className="size-4" />
            ) : (
              <Icons.copy className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Password */}
      <DashboardCredentialPasswordField
        credential={credential}
        onPasswordChange={onPasswordChange}
      />

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Label className="text-foreground text-sm font-medium">
            Description
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Icons.helpCircle className="text-muted-foreground size-3" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Add notes or context about this credential to help you remember
                its purpose
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Textarea
          {...register("description")}
          placeholder="Add a description for this credential..."
          className="border-border focus:border-ring focus:ring-ring min-h-[80px] resize-none focus:ring-1"
          autoComplete="off"
        />
      </div>

      {/* Security Settings */}
      <div className="space-y-3 pt-2">
        <Label className="text-foreground text-sm font-medium">
          Security Settings
        </Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium">Password Protection</div>
              <div className="text-muted-foreground text-xs">
                Require password for access
              </div>
            </div>
            <Switch
              checked={formData.passwordProtection}
              onCheckedChange={(checked) =>
                setValue("passwordProtection", checked, { shouldDirty: true })
              }
            />
          </div>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium">
                Two-Factor Authentication
              </div>
              <div className="text-muted-foreground text-xs">
                Enhanced security verification
              </div>
            </div>
            <Switch
              checked={formData.twoFactorAuth}
              onCheckedChange={(checked) =>
                setValue("twoFactorAuth", checked, { shouldDirty: true })
              }
            />
          </div>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium">Access Logging</div>
              <div className="text-muted-foreground text-xs">
                Track credential usage
              </div>
            </div>
            <Switch
              checked={formData.accessLogging}
              onCheckedChange={(checked) =>
                setValue("accessLogging", checked, { shouldDirty: true })
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
