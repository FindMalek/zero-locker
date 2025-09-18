"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  useCredentialKeyValuePairs,
  useCredentialKeyValuePairsWithValues,
  useUpdateCredentialKeyValuePairs,
} from "@/orpc/hooks/use-credentials"

import { handleErrors } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

import {
  KeyValuePairManager,
  type BaseKeyValuePair,
} from "@/components/shared/key-value-pair-manager"

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
  const [hasChanges, setHasChanges] = useState(false)
  const [editingData, setEditingData] = useState<KeyValuePair[]>([])
  const { toast } = useToast()

  const {
    data: keyValuePairs = [],
    isLoading,
    error,
    refetch: refetchKeyValuePairs,
  } = useCredentialKeyValuePairs(credentialId)

  // Always load values since we're always in edit mode
  const {
    data: keyValuePairsWithValues = [],
    isLoading: isLoadingValues,
    refetch: refetchKeyValuePairsWithValues,
  } = useCredentialKeyValuePairsWithValues(credentialId, true)

  const updateKeyValuePairsMutation = useUpdateCredentialKeyValuePairs()

  // Prepare data for display - always in edit mode
  const displayData: KeyValuePair[] = useMemo(() => {
    // Use local editing data when available
    if (editingData.length > 0) {
      return editingData
    }

    // Use server data with values if available
    if (keyValuePairsWithValues.length > 0) {
      return keyValuePairsWithValues
    }

    // Default empty row for new entries
    return [
      {
        id: `temp_${credentialId}_${crypto.randomUUID?.() || Math.random().toString(36)}`,
        key: "",
        value: "",
      },
    ]
  }, [keyValuePairsWithValues, editingData, credentialId])

  // Initialize editing data with server data when available
  useEffect(() => {
    if (keyValuePairsWithValues.length > 0 && editingData.length === 0) {
      setEditingData(keyValuePairsWithValues)
    }
  }, [keyValuePairsWithValues, editingData.length])

  // Notify parent about form changes
  useEffect(() => {
    onFormChange?.(hasChanges)
  }, [hasChanges, onFormChange])

  const handleChange = useCallback((newValue: KeyValuePair[]) => {
    setEditingData(newValue)
    setHasChanges(true)
  }, [])

  const handleSave = useCallback(async () => {
    try {
      // Filter valid pairs and map to API format
      const validPairs = editingData
        .filter((pair) => pair.key.trim() && pair.value.trim())
        .map((pair) => ({
          id: pair.id?.startsWith("temp_") ? undefined : pair.id, // Don't send temp IDs
          key: pair.key.trim(),
          value: pair.value.trim(),
        }))

      // Perform the mutation - this will trigger cache invalidation
      await updateKeyValuePairsMutation.mutateAsync({
        credentialId,
        keyValuePairs: validPairs,
      })

      // Force refetch both queries to ensure immediate data refresh
      await Promise.all([
        refetchKeyValuePairs(),
        refetchKeyValuePairsWithValues(),
      ])

      // Show success feedback
      toast("Additional information saved successfully", "success")

      // Reset local state - fresh data should now be available
      setHasChanges(false)
      setEditingData([])

      return { success: true }
    } catch (error) {
      const { message, details } = handleErrors(
        error,
        "Failed to update additional information"
      )

      // Show error feedback with more details
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
    credentialId,
    updateKeyValuePairsMutation,
    toast,
    refetchKeyValuePairs,
    refetchKeyValuePairsWithValues,
  ])

  const handleCancel = useCallback(() => {
    setHasChanges(false)
    setEditingData([]) // Clear editing data to revert changes
  }, [])

  // Expose save and cancel handlers for external access (e.g., toolbar)
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
    return (
      <KeyValuePairManager
        value={[]}
        onChange={() => {}}
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
      label="Additional Information"
      description="Secure key-value pairs for extra credential details"
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
      disabled={isLoadingValues}
      credentialId={credentialId}
    />
  )
}
