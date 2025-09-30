"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  useCredentialKeyValuePairs,
  useUpdateCredentialKeyValuePairs,
} from "@/orpc/hooks/use-credentials"
import { type BaseKeyValuePair } from "@/schemas/utils"

import { handleErrors } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

import { DashboardCredentialKeyValuePairsSkeleton } from "@/components/app/dashboard-credential-key-value-pairs-skeleton"
import { EncryptedKeyValueDisplay } from "@/components/shared/encrypted-key-value-display"

interface KeyValuePair extends BaseKeyValuePair {
  createdAt?: Date
  updatedAt?: Date
}

interface CredentialKeyValuePairsProps {
  credentialId: string
  onFormChange?: (hasChanges: boolean) => void
  onDataChange?: (pairs: KeyValuePair[], hasChanges: boolean) => void
}

export function CredentialKeyValuePairs({
  credentialId,
  onFormChange,
  onDataChange,
}: CredentialKeyValuePairsProps) {
  const [hasChanges, setHasChanges] = useState(false)
  const [editingData, setEditingData] = useState<KeyValuePair[]>([])
  const { toast } = useToast()

  const {
    data: keyValuePairs = [],
    isLoading,
    error,
    refetch: refetchKeyValuePairs,
  } = useCredentialKeyValuePairs(credentialId)

  const updateKeyValuePairsMutation = useUpdateCredentialKeyValuePairs()

  const displayData: KeyValuePair[] = useMemo(() => {
    if (editingData.length > 0) {
      return editingData
    }

    if (keyValuePairs.length > 0) {
      return keyValuePairs.map((pair) => ({
        ...pair,
        value: "",
      }))
    }

    return [
      {
        key: "",
        value: "",
      },
    ]
  }, [keyValuePairs, editingData, credentialId])

  useEffect(() => {
    if (keyValuePairs.length > 0 && editingData.length === 0 && !hasChanges) {
      setEditingData(
        keyValuePairs.map((pair) => ({
          ...pair,
          value: "",
        }))
      )
    }
  }, [keyValuePairs, editingData.length, hasChanges])

  useEffect(() => {
    onFormChange?.(hasChanges)
  }, [hasChanges, onFormChange])

  const handleChange = useCallback(
    (newValue: KeyValuePair[]) => {
      setEditingData(newValue)
      setHasChanges(true)
      onDataChange?.(newValue, true)
    },
    [onDataChange]
  )

  const handleSave = useCallback(async () => {
    try {
      const existingPairsKeepingValue = editingData
        .filter((pair) => pair.id && !pair.value?.trim())
        .map((pair) => ({
          id: pair.id!,
          key: pair.key!.trim(),
        }))

      const existingPairsWithNewValue = editingData
        .filter((pair) => pair.id && pair.value?.trim())
        .map((pair) => ({
          id: pair.id!,
          key: pair.key!.trim(),
          value: pair.value!.trim(),
        }))

      const newPairs = editingData
        .filter((pair) => !pair.id && pair.value?.trim() && pair.key?.trim())
        .map((pair) => ({
          key: pair.key!.trim(),
          value: pair.value!.trim(),
        }))

      const allPairsPayload = [
        ...existingPairsKeepingValue,
        ...existingPairsWithNewValue,
        ...newPairs,
      ]

      await updateKeyValuePairsMutation.mutateAsync({
        credentialId,
        keyValuePairs: allPairsPayload,
      })

      await refetchKeyValuePairs()

      toast("Additional information saved successfully", "success")
      setHasChanges(false)
      setEditingData([])

      return { success: true }
    } catch (error) {
      const { message, details } = handleErrors(
        error,
        "Failed to update additional information"
      )

      const errorMessage = details
        ? `${message}: ${Array.isArray(details) ? details.join(", ") : details}`
        : message

      toast(errorMessage, "error")

      return {
        success: false,
        error: errorMessage,
      }
    }
  }, [
    editingData,
    keyValuePairs,
    credentialId,
    updateKeyValuePairsMutation,
    toast,
    refetchKeyValuePairs,
  ])

  const handleCancel = useCallback(() => {
    setHasChanges(false)
    setEditingData([])
    onDataChange?.([], false)
  }, [onDataChange])

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Expose save/cancel handlers on window for toolbar integration
      // TODO: Replace with proper React context when implementing save toolbar
      const windowWithCredentials = window as Window & {
        credentialKeyValuePairs?: {
          save: () => Promise<{ success: boolean; error?: string }>
          cancel: () => void
          hasChanges: boolean
          data: KeyValuePair[]
        }
      }

      windowWithCredentials.credentialKeyValuePairs = {
        save: handleSave,
        cancel: handleCancel,
        hasChanges,
        data: displayData,
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        const windowWithCredentials = window as Window & {
          credentialKeyValuePairs?: {
            save: () => Promise<{ success: boolean; error?: string }>
            cancel: () => void
            hasChanges: boolean
            data: KeyValuePair[]
          }
        }
        delete windowWithCredentials.credentialKeyValuePairs
      }
    }
  }, [handleSave, handleCancel, hasChanges, displayData])

  if (isLoading) {
    return <DashboardCredentialKeyValuePairsSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="py-8 text-center">
          <p className="text-muted-foreground text-sm">
            Failed to load additional information. Please try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <EncryptedKeyValueDisplay
      value={displayData}
      onChange={handleChange}
      credentialId={credentialId}
      label="Additional Information"
      placeholder={{
        key:
          keyValuePairs.length === 0
            ? "Enter key (e.g. Security Question)"
            : "Enter key",
        value:
          keyValuePairs.length === 0
            ? "Enter value (e.g. Your first pet's name)"
            : "Enter value",
      }}
      validateDuplicateKeys={false}
      disabled={isLoading}
    />
  )
}
