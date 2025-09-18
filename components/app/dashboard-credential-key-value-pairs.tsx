"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  useCredentialKeyValuePairs,
  useCredentialKeyValuePairsWithValues,
  useUpdateCredentialKeyValuePairs,
} from "@/orpc/hooks/use-credentials"

import { handleErrors } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { KeyValuePairManager, type BaseKeyValuePair } from "@/components/shared/key-value-pair-manager"

interface KeyValuePair extends BaseKeyValuePair {
  createdAt?: Date
  updatedAt?: Date
}

interface CredentialKeyValuePairsProps {
  credentialId: string
  onFormChange?: (hasChanges: boolean) => void
}

export function CredentialKeyValuePairs({
  credentialId,
  onFormChange,
}: CredentialKeyValuePairsProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const {
    data: keyValuePairs = [],
    isLoading,
    error,
  } = useCredentialKeyValuePairs(credentialId)

  // Load values when entering edit mode
  const { data: keyValuePairsWithValues = [], isLoading: isLoadingValues } =
    useCredentialKeyValuePairsWithValues(credentialId, isEditing)

  const updateKeyValuePairsMutation = useUpdateCredentialKeyValuePairs()

  // Prepare data for display
  const displayData: KeyValuePair[] = useMemo(() => {
    if (isEditing && keyValuePairsWithValues.length > 0) {
      return keyValuePairsWithValues
    }
    if (!isEditing && keyValuePairs.length > 0) {
      return keyValuePairs.map((kv) => ({
        id: kv.id,
        key: kv.key,
        value: "", // Values hidden in view mode
        createdAt: kv.createdAt,
        updatedAt: kv.updatedAt,
      }))
    }
    return []
  }, [isEditing, keyValuePairs, keyValuePairsWithValues])

  // Auto-enter edit mode for empty state
  useEffect(() => {
    if (!isLoading && keyValuePairs.length === 0) {
      setIsEditing(true)
    }
  }, [keyValuePairs.length, isLoading])

  // Notify parent about form changes
  useEffect(() => {
    onFormChange?.(hasChanges)
  }, [hasChanges, onFormChange])

  const handleEnterEditMode = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleChange = useCallback((newValue: KeyValuePair[]) => {
    setHasChanges(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!isEditing) return { success: true }

    try {
      // Filter valid pairs
      const validPairs = displayData.filter(
        (pair) => pair.key.trim() && pair.value.trim()
      )

      await updateKeyValuePairsMutation.mutateAsync({
        credentialId,
        keyValuePairs: validPairs,
      })

      setIsEditing(false)
      setHasChanges(false)
      return { success: true }
    } catch (error) {
      const { message, details } = handleErrors(
        error,
        "Failed to update additional information"
      )
      return {
        success: false,
        error: details
          ? `${message}: ${Array.isArray(details) ? details.join(", ") : details}`
          : message,
      }
    }
  }, [isEditing, displayData, credentialId, updateKeyValuePairsMutation])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    setHasChanges(false)
  }, [])

  // Expose data and functions for external use (global save toolbar)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-expect-error - Global toolbar integration
      window.credentialKeyValuePairs = {
        data: displayData,
        save: handleSave,
        cancel: handleCancel,
        hasChanges,
        isEditing,
      }
    }
  }, [displayData, hasChanges, isEditing, handleSave, handleCancel])


  if (isLoading) {
    return (
      <KeyValuePairManager
        value={[]}
        onChange={() => {}}
        mode="edit-view"
        isEditing={false}
        label="Additional Information"
        description="Secure key-value pairs for extra credential details"
        disabled={true}
      />
    )
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
    <KeyValuePairManager
      value={displayData}
      onChange={handleChange}
      mode="edit-view"
      isEditing={isEditing}
      label="Additional Information"
      description="Secure key-value pairs for extra credential details"
      placeholder={{
        key: keyValuePairs.length === 0 ? "Enter key (e.g. Security Question)" : "Enter key",
        value: keyValuePairs.length === 0 ? "Enter value (e.g. Your first pet's name)" : "Enter value",
      }}
      onEnterEditMode={handleEnterEditMode}
      validateDuplicateKeys={true}
      disabled={isLoadingValues}
    />
  )
}
