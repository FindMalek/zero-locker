"use client"

import { useEffect, useState } from "react"
import {
  useCredentialKeyValuePairs,
  useCredentialKeyValuePairValue,
  useUpdateCredentialKeyValuePairs,
} from "@/orpc/hooks/use-credentials"

import { handleErrors } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface KeyValuePair {
  id?: string
  key: string
  value: string
  createdAt?: Date
  updatedAt?: Date
}

interface CredentialKeyValuePairsProps {
  credentialId: string
  onFormChange?: (hasChanges: boolean) => void
}

function KeyValuePairItem({
  pair,
  credentialId,
  isEditing,
  onKeyChange,
  onValueChange,
  onRemove,
}: {
  pair: any
  credentialId: string
  isEditing: boolean
  onKeyChange?: (value: string) => void
  onValueChange?: (value: string) => void
  onRemove?: () => void
}) {
  const { toast } = useToast()
  const [showValue, setShowValue] = useState(false)
  const [localValue, setLocalValue] = useState("")

  const { data: valueData, isLoading: isLoadingValue } =
    useCredentialKeyValuePairValue(
      credentialId,
      pair.id,
      showValue && !isEditing
    )

  useEffect(() => {
    if (valueData?.value) {
      setLocalValue(valueData.value)
    }
  }, [valueData])

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast("Copied to clipboard", "success")
    } catch {
      toast("Failed to copy", "error")
    }
  }

  if (isEditing) {
    return (
      <div className="bg-muted/50 flex items-end gap-3 rounded-lg border p-3">
        <div className="flex-1">
          <Label htmlFor={`key-${pair.id}`} className="text-xs">
            Key
          </Label>
          <Input
            id={`key-${pair.id}`}
            placeholder="Enter key name"
            value={pair.key}
            onChange={(e) => onKeyChange?.(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor={`value-${pair.id}`} className="text-xs">
            Value
          </Label>
          <Input
            id={`value-${pair.id}`}
            placeholder="Enter value"
            value={pair.value}
            onChange={(e) => onValueChange?.(e.target.value)}
            className="h-8"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Icons.trash className="size-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="hover:bg-muted/30 group flex items-center justify-between rounded-sm px-1 py-3 transition-colors">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{pair.key}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          {showValue ? (
            isLoadingValue ? (
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Icons.spinner className="size-3 animate-spin" />
                Decrypting...
              </div>
            ) : (
              <span className="text-muted-foreground font-mono text-xs">
                {localValue || "Failed to decrypt"}
              </span>
            )
          ) : (
            <span className="text-muted-foreground text-xs">••••••••</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowValue(!showValue)}
              className="h-7 w-7 p-0"
            >
              {showValue ? (
                <Icons.eyeOff className="size-3" />
              ) : (
                <Icons.eye className="size-3" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {showValue ? "Hide value" : "Show value"}
          </TooltipContent>
        </Tooltip>
        {showValue && localValue && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(localValue)}
                className="h-7 w-7 p-0"
              >
                <Icons.copy className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy value</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}

export function CredentialKeyValuePairs({
  credentialId,
  onFormChange,
}: CredentialKeyValuePairsProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [localPairs, setLocalPairs] = useState<KeyValuePair[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  const {
    data: keyValuePairs = [],
    isLoading,
    error,
  } = useCredentialKeyValuePairs(credentialId)

  const updateKeyValuePairsMutation = useUpdateCredentialKeyValuePairs()

  // Initialize local pairs when data loads
  useEffect(() => {
    if (keyValuePairs.length > 0) {
      setLocalPairs(
        keyValuePairs.map((kv) => ({
          id: kv.id,
          key: kv.key,
          value: "", // Values loaded separately for security
          createdAt: kv.createdAt,
          updatedAt: kv.updatedAt,
        }))
      )
    } else {
      setLocalPairs([])
    }
    setHasChanges(false)
  }, [keyValuePairs])

  // Notify parent about form changes
  useEffect(() => {
    onFormChange?.(hasChanges)
  }, [hasChanges, onFormChange])

  const handleAddPair = () => {
    const newPair: KeyValuePair = {
      key: "",
      value: "",
    }
    setLocalPairs([...localPairs, newPair])
    setHasChanges(true)
  }

  const handleRemovePair = (index: number) => {
    const updatedPairs = localPairs.filter((_, i) => i !== index)
    setLocalPairs(updatedPairs)
    setHasChanges(true)
  }

  const handleKeyChange = (index: number, newKey: string) => {
    // Check for duplicate keys
    const trimmedKey = newKey.trim()
    if (trimmedKey) {
      const isDuplicate = localPairs.some(
        (pair, i) =>
          i !== index &&
          pair.key.trim().toLowerCase() === trimmedKey.toLowerCase()
      )

      if (isDuplicate) {
        toast(
          "A key with this name already exists. Please use a unique key name.",
          "error"
        )
        return
      }
    }

    const updatedPairs = localPairs.map((pair, i) =>
      i === index ? { ...pair, key: newKey } : pair
    )
    setLocalPairs(updatedPairs)
    setHasChanges(true)
  }

  const handleValueChange = (index: number, newValue: string) => {
    const updatedPairs = localPairs.map((pair, i) =>
      i === index ? { ...pair, value: newValue } : pair
    )
    setLocalPairs(updatedPairs)
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      // Filter out empty pairs
      const validPairs = localPairs.filter(
        (pair) => pair.key.trim() && pair.value.trim()
      )

      await updateKeyValuePairsMutation.mutateAsync({
        credentialId,
        keyValuePairs: validPairs,
      })

      toast("Additional information updated successfully", "success")
      setIsEditing(false)
      setHasChanges(false)
    } catch (error) {
      const { message, details } = handleErrors(
        error,
        "Failed to update additional information"
      )
      toast(
        details
          ? `${message}: ${Array.isArray(details) ? details.join(", ") : details}`
          : message,
        "error"
      )
    }
  }

  const handleCancel = () => {
    // Reset to original data
    if (keyValuePairs.length > 0) {
      setLocalPairs(
        keyValuePairs.map((kv) => ({
          id: kv.id,
          key: kv.key,
          value: "", // Values loaded separately for security
          createdAt: kv.createdAt,
          updatedAt: kv.updatedAt,
        }))
      )
    } else {
      setLocalPairs([])
    }
    setIsEditing(false)
    setHasChanges(false)
  }

  // Expose save and cancel functions for external use (save toolbar)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore - Attach to window for save toolbar access
      window.credentialKeyValuePairs = {
        save: handleSave,
        cancel: handleCancel,
        hasChanges,
        isEditing,
      }
    }
  }, [hasChanges, isEditing])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Additional Information</h3>
        </div>
        <div className="flex items-center gap-2 py-8">
          <Icons.spinner className="size-4 animate-spin" />
          <span className="text-muted-foreground text-sm">
            Loading additional information...
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Additional Information</h3>
        </div>
        <div className="py-8 text-center">
          <Icons.warning className="text-destructive mx-auto mb-2 size-8" />
          <p className="text-muted-foreground text-sm">
            Failed to load additional information. Please try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Additional Information</h3>
          <p className="text-muted-foreground text-sm">
            Secure key-value pairs for extra credential details
          </p>
        </div>
        {!isEditing && keyValuePairs.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Icons.pencil className="mr-2 size-4" />
            Edit
          </Button>
        )}
      </div>

      {!isEditing ? (
        // View mode
        <div>
          {keyValuePairs.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <Icons.info className="text-muted-foreground mx-auto mb-3 size-8" />
              <h4 className="mb-2 text-sm font-medium">
                No additional information
              </h4>
              <p className="text-muted-foreground mx-auto mb-4 max-w-sm text-xs">
                Add custom key-value pairs to store additional information like
                security questions, backup codes, or notes.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Icons.add className="mr-2 size-4" />
                Add Information
              </Button>
            </div>
          ) : (
            <div className="space-y-1 rounded-lg border p-1">
              {keyValuePairs.map((pair) => (
                <KeyValuePairItem
                  key={pair.id}
                  pair={pair}
                  credentialId={credentialId}
                  isEditing={false}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Edit mode
        <div className="space-y-4 rounded-lg border p-4">
          <div className="space-y-3">
            {localPairs.map((pair, index) => (
              <KeyValuePairItem
                key={pair.id || index}
                pair={pair}
                credentialId={credentialId}
                isEditing={true}
                onKeyChange={(value) => handleKeyChange(index, value)}
                onValueChange={(value) => handleValueChange(index, value)}
                onRemove={() => handleRemovePair(index)}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAddPair}
            className="w-full border-dashed"
          >
            <Icons.add className="mr-2 size-4" />
            Add Pair
          </Button>

          <div className="flex items-center justify-between border-t pt-3">
            <div className="text-muted-foreground text-xs">
              {hasChanges ? "You have unsaved changes" : "No changes"}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateKeyValuePairsMutation.isPending}
              >
                {updateKeyValuePairsMutation.isPending ? (
                  <>
                    <Icons.spinner className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icons.save className="mr-2 size-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
