"use client"

import React, { useState } from "react"
import { useCredentialPassword } from "@/orpc/hooks/use-credentials"
import type { CredentialOutput } from "@/schemas/credential/dto"

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

interface CredentialFormData {
  identifier: string
  description: string | null
  passwordProtection: boolean
  twoFactorAuth: boolean
  accessLogging: boolean
}

interface CredentialFormProps {
  credential?: CredentialOutput
  data: CredentialFormData
  onChange: (data: CredentialFormData) => void
}

export function CredentialForm({
  credential,
  data,
  onChange,
}: CredentialFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { copy, isCopied } = useCopyToClipboard({ successDuration: 1000 })

  const { data: passwordData, isLoading: isLoadingPassword } =
    useCredentialPassword(
      credential?.id || "",
      showPassword && Boolean(credential?.id)
    )

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword)
  }

  const handleCopy = async (text: string) => {
    await copy(text)
  }

  return (
    <div className="space-y-5">
      {/* Identifier */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Label className="text-foreground text-sm font-medium">
            Identifier
          </Label>
          <Icons.helpCircle className="text-muted-foreground h-3 w-3" />
        </div>
        <div className="relative">
          <Input
            value={data.identifier}
            onChange={(e) => onChange({ ...data, identifier: e.target.value })}
            className="border-border focus:border-ring focus:ring-ring pr-8 focus:ring-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hover:bg-muted absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
            onClick={() => handleCopy(data.identifier)}
          >
            {isCopied ? (
              <Icons.check className="h-3 w-3" />
            ) : (
              <Icons.copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Label className="text-foreground text-sm font-medium">
            Password
          </Label>
          <Icons.helpCircle className="text-muted-foreground h-3 w-3" />
        </div>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={showPassword ? passwordData?.password || "" : "••••••••••••"}
            readOnly
            className="border-border focus:border-ring focus:ring-ring pr-16 focus:ring-1"
          />
          <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hover:bg-muted h-6 w-6 p-0"
              onClick={() => handleCopy(passwordData?.password || "")}
              disabled={!showPassword || !passwordData?.password}
            >
              <Icons.copy className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hover:bg-muted h-6 w-6 p-0"
              onClick={handlePasswordToggle}
              disabled={isLoadingPassword}
            >
              {isLoadingPassword ? (
                <div className="border-muted-foreground h-3 w-3 animate-spin rounded-full border border-t-transparent" />
              ) : showPassword ? (
                <Icons.eyeOff className="h-3 w-3" />
              ) : (
                <Icons.eye className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-foreground text-sm font-medium">
          Description
        </Label>
        <Textarea
          value={data.description || ""}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Add a description for this credential..."
          className="border-border focus:border-ring focus:ring-ring min-h-[80px] resize-none focus:ring-1"
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
              checked={data.passwordProtection}
              onCheckedChange={(checked) =>
                onChange({ ...data, passwordProtection: checked })
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
              checked={data.twoFactorAuth}
              onCheckedChange={(checked) =>
                onChange({ ...data, twoFactorAuth: checked })
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
              checked={data.accessLogging}
              onCheckedChange={(checked) =>
                onChange({ ...data, accessLogging: checked })
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
