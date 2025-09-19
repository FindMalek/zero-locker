"use client"

import React, { useCallback, useEffect, useState } from "react"
import {
  useCredentialPassword,
  useUpdateCredentialPassword,
} from "@/orpc/hooks/use-credentials"
import type { CredentialOutput } from "@/schemas/credential/dto"

import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"
import { handleErrors } from "@/lib/utils"
import { generatePassword } from "@/lib/utils/password-helpers"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { useToast } from "@/hooks/use-toast"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PasswordFieldProps {
  credential?: CredentialOutput
  onPasswordChange?: (hasChanges: boolean) => void
}

export function DashboardCredentialPasswordField({
  credential,
  onPasswordChange,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [isPasswordModified, setIsPasswordModified] = useState(false)

  const { copy, isCopied } = useCopyToClipboard({ successDuration: 1000 })
  const { toast } = useToast()
  const updatePasswordMutation = useUpdateCredentialPassword()

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

  const handlePasswordChange = (value: string) => {
    setCurrentPassword(value)
    const hasChanged = value !== (passwordData?.password || "")
    setIsPasswordModified(hasChanged)
    onPasswordChange?.(hasChanged)
  }

  const generateSecurePassword = () => {
    // Use the existing robust password generation function
    const password = generatePassword(16)
    handlePasswordChange(password)
    setShowPassword(true) // Show the generated password
  }

  const savePasswordChanges = useCallback(async () => {
    if (!credential?.id || !isPasswordModified) {
      return
    }

    if (!currentPassword.trim()) {
      toast("Password cannot be empty", "error")
      return
    }

    try {
      // Encrypt the new password
      const key = await generateEncryptionKey()
      const encryptResult = await encryptData(currentPassword, key)
      const keyString = await exportKey(key as CryptoKey)

      await updatePasswordMutation.mutateAsync({
        id: credential.id,
        passwordEncryption: {
          encryptedValue: encryptResult.encryptedData,
          iv: encryptResult.iv,
          encryptionKey: keyString,
        },
      })

      toast("Password updated successfully", "success")
      setIsPasswordModified(false)
      onPasswordChange?.(false)
    } catch (error) {
      const { message } = handleErrors(error, "Failed to update password")
      toast(message, "error")
    }
  }, [
    credential?.id,
    isPasswordModified,
    currentPassword,
    toast,
    updatePasswordMutation,
    onPasswordChange,
  ])

  const discardPasswordChanges = useCallback(() => {
    setCurrentPassword(passwordData?.password || "")
    setIsPasswordModified(false)
    onPasswordChange?.(false)
  }, [passwordData?.password, onPasswordChange])

  // Sync current password with fetched data when password is revealed
  useEffect(() => {
    if (showPassword && passwordData?.password && !isPasswordModified) {
      setCurrentPassword(passwordData.password)
    }
  }, [showPassword, passwordData?.password, isPasswordModified])

  // Expose save and discard functions to parent via window object for floating toolbar
  useEffect(() => {
    if (typeof window !== "undefined" && credential?.id) {
      // @ts-expect-error - dynamically adding to window object
      window.credentialPasswordSave = savePasswordChanges
      // @ts-expect-error - dynamically adding to window object
      window.credentialPasswordDiscard = discardPasswordChanges
    }
    return () => {
      if (typeof window !== "undefined") {
        // @ts-expect-error - dynamically removing from window object
        delete window.credentialPasswordSave
        // @ts-expect-error - dynamically removing from window object
        delete window.credentialPasswordDiscard
      }
    }
  }, [credential?.id, savePasswordChanges, discardPasswordChanges])

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Label className="text-foreground text-sm font-medium">Password</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Icons.helpCircle className="text-muted-foreground size-3" />
          </TooltipTrigger>
          <TooltipContent>
            <p>
              The password is encrypted and stored securely. Click to edit or
              generate a new one.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          value={
            showPassword
              ? currentPassword || passwordData?.password || ""
              : "••••••••••••"
          }
          onChange={(e) => handlePasswordChange(e.target.value)}
          readOnly={!showPassword}
          placeholder="Enter password"
          className="border-border focus:border-ring focus:ring-ring pr-20 focus:ring-1"
          autoComplete="current-password"
        />
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hover:bg-muted"
            onClick={generateSecurePassword}
            title="Generate secure password"
          >
            <Icons.refresh className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hover:bg-muted"
            onClick={() =>
              handleCopy(currentPassword || passwordData?.password || "")
            }
            disabled={
              !showPassword || (!currentPassword && !passwordData?.password)
            }
          >
            {isCopied ? (
              <Icons.check className="size-4" />
            ) : (
              <Icons.copy className="size-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hover:bg-muted"
            onClick={handlePasswordToggle}
            disabled={isLoadingPassword}
          >
            {isLoadingPassword ? (
              <div className="border-muted-foreground size-4 animate-spin rounded-full border border-t-transparent" />
            ) : showPassword ? (
              <Icons.eyeOff className="size-4" />
            ) : (
              <Icons.eye className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
