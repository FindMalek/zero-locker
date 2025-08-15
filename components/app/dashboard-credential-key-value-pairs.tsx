"use client"

import { useCallback, useEffect, useState } from "react"
import {
  useCredentialKeyValuePairs,
  useCredentialKeyValuePairsWithValues,
  useCredentialKeyValuePairValue,
  useUpdateCredentialKeyValuePairs,
} from "@/orpc/hooks/use-credentials"

import { cn, handleErrors } from "@/lib/utils"
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
  totalPairs = 1,
}: {
  pair: KeyValuePair
  credentialId: string
  isEditing: boolean
  onKeyChange?: (value: string) => void
  onValueChange?: (value: string) => void
  onRemove?: () => void
  totalPairs?: number
}) {
  const { toast } = useToast()
  const [showValue, setShowValue] = useState(false)
  const [localValue, setLocalValue] = useState("")

  // Only fetch values in view mode when show value is requested
  const shouldFetchValue = Boolean(pair.id) && showValue && !isEditing

  const { data: valueData, isLoading: isLoadingValue } =
    useCredentialKeyValuePairValue(
      credentialId,
      pair.id || "", // Provide fallback to avoid undefined
      shouldFetchValue
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
      <div className="flex items-start gap-2 p-3 sm:gap-3 sm:p-4">
        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
          <div>
            <Input
              placeholder="Enter key name"
              value={pair.key}
              onChange={(e) => onKeyChange?.(e.target.value)}
              className="font-mono text-xs"
              autoComplete="off"
            />
          </div>
          <div>
            <Input
              variant="password"
              placeholder="Enter value"
              value={pair.value}
              onChange={(e) => onValueChange?.(e.target.value)}
              className="font-mono text-xs"
              autoComplete="new-password"
            />
          </div>
        </div>
        {totalPairs > 1 && (
          <div className="flex flex-shrink-0 items-center justify-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-muted-foreground hover:text-destructive flex size-8 items-center justify-center"
            >
              <Icons.trash className="size-4" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2 p-3 sm:gap-3 sm:p-4">
      <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
        <div>
          <Input
            value={pair.key}
            readOnly
            className="font-mono text-xs"
            autoComplete="off"
          />
        </div>
        <div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showValue ? "text" : "password"}
                value={
                  showValue
                    ? isLoadingValue
                      ? "Decrypting..."
                      : localValue || "Failed to decrypt"
                    : "••••••••"
                }
                readOnly
                className="pr-16 font-mono text-xs"
                autoComplete="off"
              />
              <div className="absolute inset-y-0 right-1 flex items-center">
                <div className="flex items-center gap-0.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowValue(!showValue)}
                        className="h-7 w-7 p-0"
                        disabled={isLoadingValue}
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
                  {showValue && localValue && !isLoadingValue && (
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
            </div>
          </div>
        </div>
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

  // Load values when entering edit mode
  const { data: keyValuePairsWithValues = [], isLoading: isLoadingValues } =
    useCredentialKeyValuePairsWithValues(credentialId, isEditing)

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

  const handleEnterEditMode = async () => {
    setIsEditing(true)
    // The hook will automatically load values when isEditing becomes true
  }

  // Update local pairs when values are loaded in edit mode
  useEffect(() => {
    if (isEditing && keyValuePairsWithValues.length > 0 && !isLoadingValues) {
      // Use the pairs with values from the new hook
      setLocalPairs(keyValuePairsWithValues)
      setHasChanges(false)
    } else if (
      isEditing &&
      !isLoadingValues &&
      keyValuePairsWithValues.length === 0
    ) {
      // Start with one empty pair if no existing data
      setLocalPairs([{ key: "", value: "" }])
      setHasChanges(false)
    }
  }, [isEditing, keyValuePairsWithValues, isLoadingValues])

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

  const handleSave = useCallback(async () => {
    try {
      // Filter out empty pairs
      const validPairs = localPairs.filter(
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
  }, [localPairs, credentialId, updateKeyValuePairsMutation])

  const handleCancel = useCallback(() => {
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
  }, [keyValuePairs])

  // Expose data and functions for external use (global save toolbar)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-expect-error - Attach to window for save toolbar access
      window.credentialKeyValuePairs = {
        data: localPairs,
        save: handleSave,
        cancel: handleCancel,
        hasChanges,
        isEditing,
      }
    }
  }, [localPairs, hasChanges, isEditing, handleSave, handleCancel])

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Additional Information</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Icons.helpCircle className="text-muted-foreground size-3" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Secure key-value pairs for extra credential details</p>
            </TooltipContent>
          </Tooltip>
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
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Additional Information</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Icons.helpCircle className="text-muted-foreground size-3" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Secure key-value pairs for extra credential details</p>
            </TooltipContent>
          </Tooltip>
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
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Additional Information</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Icons.helpCircle className="text-muted-foreground size-3" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Secure key-value pairs for extra credential details</p>
          </TooltipContent>
        </Tooltip>
        {!isEditing && keyValuePairs.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEnterEditMode}
            className="ml-auto"
          >
            <Icons.pencil className="mr-1 size-3" />
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
              <Button variant="outline" size="sm" onClick={handleEnterEditMode}>
                <Icons.add className="mr-2 size-4" />
                Add Information
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <div className="space-y-0">
                {keyValuePairs.map((pair, index) => (
                  <div
                    key={pair.id}
                    className={cn(index > 0 && "border-border border-t")}
                  >
                    {index === 0 && (
                      <div className="flex items-start gap-2 p-3 pb-2 sm:gap-3 sm:p-4">
                        <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                          <div>
                            <Label className="text-muted-foreground mb-2 block text-xs uppercase tracking-wide">
                              Key
                            </Label>
                          </div>
                          <div>
                            <Label className="text-muted-foreground mb-2 block text-xs uppercase tracking-wide">
                              Value
                            </Label>
                          </div>
                        </div>
                      </div>
                    )}
                    <KeyValuePairItem
                      pair={{ ...pair, value: "" }}
                      credentialId={credentialId}
                      isEditing={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Edit mode
        <div className="overflow-hidden rounded-lg border">
          <div className="space-y-0">
            {localPairs.map((pair, index) => (
              <div
                key={pair.id || index}
                className={cn(index > 0 && "border-border border-t")}
              >
                <KeyValuePairItem
                  pair={pair}
                  credentialId={credentialId}
                  isEditing={true}
                  totalPairs={localPairs.length}
                  onKeyChange={(value) => handleKeyChange(index, value)}
                  onValueChange={(value) => handleValueChange(index, value)}
                  onRemove={() => handleRemovePair(index)}
                />
              </div>
            ))}
          </div>

          <div className="border-border border-t p-3 sm:p-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddPair}
              className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2"
            >
              <Icons.add className="size-4" />
              Add Another
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
