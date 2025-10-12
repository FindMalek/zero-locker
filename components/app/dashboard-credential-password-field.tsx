"use client"

import React, { useCallback, useEffect, useState } from "react"
import {
  useCredentialPassword,
  useUpdateCredentialPassword,
} from "@/orpc/hooks/use-credentials"
import type { CredentialOutput } from "@/schemas/credential/dto"

import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"
import { getSensitiveValueDisplay, handleErrors } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

import { Icons } from "@/components/shared/icons"
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
  const [currentPassword, setCurrentPassword] = useState("")
  const [isPasswordModified, setIsPasswordModified] = useState(false)
  const [shouldFetchPassword, setShouldFetchPassword] = useState(false)

  const { toast } = useToast()
  const updatePasswordMutation = useUpdateCredentialPassword()

  const { data: passwordData, isLoading: isLoadingPassword } =
    useCredentialPassword(credential?.id || "", shouldFetchPassword)

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCurrentPassword(value)
    const hasChanged = value !== (passwordData?.password || "")
    setIsPasswordModified(hasChanged)
    onPasswordChange?.(hasChanged)
  }

  const handleGenerate = (password: string) => {
    setCurrentPassword(password)
    const hasChanged = password !== (passwordData?.password || "")
    setIsPasswordModified(hasChanged)
    onPasswordChange?.(hasChanged)
  }

  const handleEyeClick = () => {
    // Only fetch password when user explicitly clicks to reveal it
    if (!shouldFetchPassword) {
      setShouldFetchPassword(true)
    }
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

  useEffect(() => {
    if (passwordData?.password && !isPasswordModified) {
      setCurrentPassword(passwordData.password)
    }
  }, [passwordData?.password, isPasswordModified])

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
      <Input
        variant="password-full"
        value={getSensitiveValueDisplay({
          currentValue: currentPassword,
          fetchedValue: passwordData?.password,
          shouldFetch: shouldFetchPassword,
          hasEncryptedValue: Boolean(credential?.id),
        })}
        onChange={handlePasswordChange}
        onGenerate={handleGenerate}
        onEyeClick={handleEyeClick}
        showGenerateButton={true}
        placeholder="Enter password"
        autoComplete="current-password"
        isLoading={isLoadingPassword}
        className="border-border focus:border-ring focus:ring-ring focus:ring-1"
      />
    </div>
  )
}
