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
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [editingData, setEditingData] = useState<KeyValuePair[]>([])

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
    if (isEditing) {
      // Use local editing data when in edit mode
      return editingData.length > 0 ? editingData : 
        keyValuePairsWithValues.length > 0 ? keyValuePairsWithValues :
        [{ id: `temp_${credentialId}_${Date.now()}`, key: "", value: "" }]
    }
    if (!isEditing && keyValuePairs.length > 0) {
      return keyValuePairs.map((kv) => ({
        id: kv.id,
        key: kv.key,
        value: "••••••••", // Show masked placeholder in view mode
        createdAt: kv.createdAt,
        updatedAt: kv.updatedAt,
      }))
    }
    return []
  }, [isEditing, keyValuePairs, keyValuePairsWithValues, editingData, credentialId])

  // Auto-enter edit mode for empty state
  useEffect(() => {
    if (!isLoading && keyValuePairs.length === 0) {
      setEditingData([{ id: `temp_${credentialId}_${Date.now()}`, key: "", value: "" }])
      setIsEditing(true)
    }
  }, [keyValuePairs.length, isLoading, credentialId])

  // Initialize editing data when entering edit mode and server data loads
  useEffect(() => {
    if (isEditing && keyValuePairsWithValues.length > 0 && editingData.length === 0) {
      setEditingData(keyValuePairsWithValues)
    }
  }, [isEditing, keyValuePairsWithValues, editingData.length])

  // Notify parent about form changes
  useEffect(() => {
    onFormChange?.(hasChanges)
  }, [hasChanges, onFormChange])

  const handleEnterEditMode = useCallback(() => {
    // Don't clear existing data - wait for the server data to load
    setIsEditing(true)
  }, [])

  const handleChange = useCallback((newValue: KeyValuePair[]) => {
    setEditingData(newValue)
    setHasChanges(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!isEditing) return { success: true }

    try {
      // Filter valid pairs from editing data
      const validPairs = editingData.filter(
        (pair) => pair.key.trim() && pair.value.trim()
      )

      await updateKeyValuePairsMutation.mutateAsync({
        credentialId,
        keyValuePairs: validPairs,
      })

      setIsEditing(false)
      setHasChanges(false)
      setEditingData([]) // Clear editing data
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
  }, [isEditing, editingData, credentialId, updateKeyValuePairsMutation])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    setHasChanges(false)
    setEditingData([]) // Clear editing data
  }, [])

  // Expose data and functions for external use (global save toolbar)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-expect-error - Global toolbar integration
      window.credentialKeyValuePairs = {
        data: isEditing ? editingData : displayData,
        save: handleSave,
        cancel: handleCancel,
        hasChanges,
        isEditing,
      }
    }
  }, [displayData, editingData, hasChanges, isEditing, handleSave, handleCancel])


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
      credentialId={credentialId}
    />
  )
}
