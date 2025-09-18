"use client"

import { useCallback, useEffect, useState } from "react"
import { useCredentialKeyValuePairValue } from "@/orpc/hooks/use-credentials"
import { GenericEncryptedKeyValuePairDto } from "@/schemas/encryption/encryption"

import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"
import { cn } from "@/lib/utils"
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

// Generic key-value pair interface
export interface BaseKeyValuePair {
  id?: string
  key: string
  value: string
  [key: string]: any // Allow additional properties
}

// Extended interface for encrypted pairs
export interface EncryptedKeyValuePair extends BaseKeyValuePair {
  isEncrypting?: boolean
  encrypted?: boolean
}

// Persistence strategies
export type PersistenceMode = "api" | "encryption" | "none"

// Internal component for value input with API integration and processing states
interface ValueInputProps<T extends BaseKeyValuePair> {
  pair: T
  index: number
  credentialId?: string
  isEditing: boolean
  placeholder?: string
  disabled?: boolean
  onValueChange: (index: number, value: string) => void
  getIsProcessing?: (item: T) => boolean
  onValueBlur?: (index: number) => Promise<void> | void
}

function ValueInput<T extends BaseKeyValuePair>({
  pair,
  index,
  credentialId,
  isEditing,
  placeholder = "Enter value",
  disabled = false,
  onValueChange,
  getIsProcessing,
  onValueBlur,
}: ValueInputProps<T>) {
  const [shouldFetchValue, setShouldFetchValue] = useState(false)

  const { data: valueData, isLoading: isLoadingValue } =
    useCredentialKeyValuePairValue(
      credentialId || "",
      pair.id || "",
      shouldFetchValue &&
        !isEditing &&
        !!pair.id &&
        !pair.id.startsWith("temp_") &&
        !!credentialId
    )

  // Use real value when fetched, otherwise use the current value
  const displayValue = valueData?.value || pair.value

  // Check if this item is being processed (e.g., encrypting)
  const isProcessing = getIsProcessing?.(pair) || false

  const handleEyeClick = useCallback(() => {
    if (!valueData?.value && !isLoadingValue && credentialId && !isProcessing) {
      setShouldFetchValue(true)
    }
  }, [valueData?.value, isLoadingValue, credentialId, isProcessing])

  if (isEditing) {
    // Edit mode: regular text input
    return (
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={pair.value}
          onChange={(e) => onValueChange(index, e.target.value)}
          onBlur={() => onValueBlur?.(index)}
          disabled={disabled || isProcessing}
          className="font-mono text-xs"
          autoComplete="new-password"
        />
        {isProcessing && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <Icons.spinner className="size-4 animate-spin" />
          </div>
        )}
      </div>
    )
  }

  // View mode: password-copyable input with API-driven reveal
  return (
    <div className="relative">
      <Input
        variant="password-copyable"
        value={displayValue}
        readOnly
        disabled={disabled || isProcessing}
        className="font-mono text-xs"
        onEyeClick={handleEyeClick}
      />
      {(isLoadingValue || isProcessing) && (
        <div className="absolute inset-y-0 right-16 flex items-center">
          <Icons.spinner className="size-4 animate-spin" />
        </div>
      )}
    </div>
  )
}

interface KeyValuePairManagerProps<T extends BaseKeyValuePair> {
  // Required
  value: T[]
  onChange: (value: T[]) => void

  // Configuration
  mode?: "single" | "edit-view"
  isEditing?: boolean
  persistenceMode?: PersistenceMode

  // Content
  label?: string
  description?: string
  placeholder?: {
    key?: string
    value?: string
  }

  // Behavior
  validateDuplicateKeys?: boolean
  disabled?: boolean
  className?: string

  // Callbacks
  onEnterEditMode?: () => void

  // API mode (for existing credentials)
  credentialId?: string

  // Encryption mode (for new credentials)
  onEncryptedChange?: (encrypted: GenericEncryptedKeyValuePairDto[]) => void
  autoEncryptOnBlur?: boolean

  // Processing state
  getIsProcessing?: (item: T) => boolean
}

export function KeyValuePairManager<T extends BaseKeyValuePair>({
  value,
  onChange,
  mode = "single",
  isEditing = true,
  persistenceMode = "none",
  label = "Key-Value Pairs",
  description = "Manage key-value pair data",
  placeholder = { key: "Enter key", value: "Enter value" },
  validateDuplicateKeys = true,
  disabled = false,
  className,
  onEnterEditMode,
  credentialId,
  onEncryptedChange,
  autoEncryptOnBlur = false,
  getIsProcessing,
}: KeyValuePairManagerProps<T>) {
  const { toast } = useToast()
  const [localPairs, setLocalPairs] = useState<T[]>(() => {
    if (value.length === 0) {
      return [{ id: `temp_empty`, key: "", value: "" } as T]
    }
    return value.map((pair) => ({ ...pair }))
  })

  // Sync with external value changes
  useEffect(() => {
    if (value.length === 0) {
      setLocalPairs([{ id: `temp_empty`, key: "", value: "" } as T])
    } else {
      setLocalPairs(value.map((pair) => ({ ...pair })))
    }
  }, [value])

  const validateKey = useCallback(
    (key: string, currentIndex: number) => {
      if (!validateDuplicateKeys) return true

      const trimmedKey = key.trim()
      if (!trimmedKey) return true

      const isDuplicate = localPairs.some(
        (pair, i) =>
          i !== currentIndex &&
          pair.key.trim().toLowerCase() === trimmedKey.toLowerCase()
      )

      if (isDuplicate) {
        toast(
          "A key with this name already exists. Please use a unique key name.",
          "error"
        )
        return false
      }
      return true
    },
    [localPairs, validateDuplicateKeys, toast]
  )

  const handleAddPair = useCallback(() => {
    const newPair = {
      id: `temp_${Date.now()}_${Math.random()}`,
      key: "",
      value: "",
    } as T
    const updated = [...localPairs, newPair]
    setLocalPairs(updated)
    onChange(updated)
  }, [localPairs, onChange])

  const handleRemovePair = useCallback(
    (index: number) => {
      const updated = localPairs.filter((_, i) => i !== index)
      setLocalPairs(updated)
      onChange(updated)
    },
    [localPairs, onChange]
  )

  const handleKeyChange = useCallback(
    (index: number, newKey: string) => {
      const updated = localPairs.map((pair, i) =>
        i === index ? { ...pair, key: newKey } : pair
      )
      setLocalPairs(updated)
      onChange(updated)
    },
    [localPairs, onChange]
  )

  const handleValueChange = useCallback(
    (index: number, newValue: string) => {
      const updated = localPairs.map((pair, i) =>
        i === index ? { ...pair, value: newValue } : pair
      )
      setLocalPairs(updated)
      onChange(updated)
    },
    [localPairs, onChange]
  )

  const handleKeyBlur = useCallback(
    (index: number) => {
      const pair = localPairs[index]
      if (!validateKey(pair.key, index)) {
        // Reset key on validation failure
        handleKeyChange(index, "")
      }
    },
    [localPairs, validateKey, handleKeyChange]
  )

  // Handle encryption on blur for encryption mode
  const handleEncryptOnBlur = useCallback(
    async (item: T, index: number) => {
      if (!item.key.trim() || !item.value.trim() || !onEncryptedChange) {
        return
      }

      try {
        // Set encrypting state
        const updated = localPairs.map((pair, i) =>
          i === index ? ({ ...pair, isEncrypting: true } as T) : pair
        )
        setLocalPairs(updated)

        // Generate encryption key and encrypt value
        const key = await generateEncryptionKey()
        const encryptResult = await encryptData(item.value, key)
        const keyString = await exportKey(key as CryptoKey)

        const encryptedPair: GenericEncryptedKeyValuePairDto = {
          id: item.id?.startsWith("temp_")
            ? `kv_${Date.now()}`
            : item.id || `kv_${Date.now()}`,
          key: item.key,
          valueEncryption: {
            encryptedValue: encryptResult.encryptedData,
            iv: encryptResult.iv,
            encryptionKey: keyString,
          },
        }

        // Get current encrypted values
        const currentEncrypted = (value as any[]).filter(
          (pair: any) => pair.valueEncryption && pair.id !== item.id
        ) as GenericEncryptedKeyValuePairDto[]

        // Add or update the encrypted pair
        const updatedEncrypted = [...currentEncrypted, encryptedPair]
        onEncryptedChange(updatedEncrypted)

        // Clear the local value but keep the key
        const clearedLocal = localPairs.map((pair, i) =>
          i === index
            ? ({ ...pair, value: "", isEncrypting: false } as T)
            : pair
        )
        setLocalPairs(clearedLocal)
        onChange(clearedLocal)
      } catch (error) {
        console.error("Failed to encrypt value:", error)
        toast("Failed to encrypt value", "error")

        // Reset encrypting state
        const resetLocal = localPairs.map((pair, i) =>
          i === index ? ({ ...pair, isEncrypting: false } as T) : pair
        )
        setLocalPairs(resetLocal)
      }
    },
    [localPairs, value, onEncryptedChange, onChange, toast]
  )

  const handleValueBlur = useCallback(
    async (index: number) => {
      const pair = localPairs[index]
      if (!pair) return

      // Auto-encrypt on blur if enabled
      if (autoEncryptOnBlur && persistenceMode === "encryption") {
        await handleEncryptOnBlur(pair, index)
      }
    },
    [localPairs, autoEncryptOnBlur, persistenceMode, handleEncryptOnBlur]
  )

  // Determine current mode state
  const shouldShowEditMode =
    mode === "single" || (mode === "edit-view" && isEditing)

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">{label}</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Icons.helpCircle className="text-muted-foreground size-3" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
        {mode === "edit-view" &&
          !isEditing &&
          localPairs.some((p) => p.key || p.value) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEnterEditMode}
              className="ml-auto"
            >
              <Icons.pencil className="mr-1 size-3" />
              Edit
            </Button>
          )}
      </div>

      {/* Content */}
      <div className="overflow-hidden rounded-lg border">
        <div className="space-y-0">
          {localPairs.map((pair, index) => (
            <div
              key={pair.id || index}
              className={cn(
                "flex items-start gap-2 p-3 sm:gap-3 sm:p-4",
                index > 0 && "border-border border-t"
              )}
            >
              <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                <div>
                  {index === 0 && (
                    <Label className="text-muted-foreground mb-2 block text-xs uppercase tracking-wide">
                      Key
                    </Label>
                  )}
                  <Input
                    placeholder={placeholder.key}
                    value={pair.key}
                    onChange={(e) => handleKeyChange(index, e.target.value)}
                    onBlur={() => handleKeyBlur(index)}
                    readOnly={!shouldShowEditMode}
                    disabled={disabled}
                    className="font-mono text-xs"
                    autoComplete="off"
                  />
                </div>
                <div>
                  {index === 0 && (
                    <Label className="text-muted-foreground mb-2 block text-xs uppercase tracking-wide">
                      Value
                    </Label>
                  )}
                  <ValueInput
                    pair={pair}
                    index={index}
                    credentialId={credentialId}
                    isEditing={shouldShowEditMode}
                    placeholder={placeholder.value}
                    disabled={disabled}
                    onValueChange={handleValueChange}
                    getIsProcessing={getIsProcessing}
                    onValueBlur={handleValueBlur}
                  />
                </div>
              </div>

              {shouldShowEditMode && localPairs.length > 1 && (
                <div className={cn("flex", index === 0 ? "pt-6" : "pt-0")}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePair(index)}
                    disabled={disabled}
                    className="text-muted-foreground hover:text-destructive flex flex-shrink-0 items-center justify-center"
                  >
                    <Icons.trash className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}

          {shouldShowEditMode && (
            <div className="border-border border-t p-3 sm:p-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPair}
                disabled={disabled}
                className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2"
              >
                <Icons.add className="size-4" />
                Add Another
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Convenience export for encrypted key-value form (legacy compatibility)
export interface EncryptedKeyValueFormProps {
  value: GenericEncryptedKeyValuePairDto[]
  onChange: (value: GenericEncryptedKeyValuePairDto[]) => void
  label?: string
  description?: string
  placeholder?: {
    key?: string
    value?: string
  }
  className?: string
  disabled?: boolean
}

export function EncryptedKeyValueForm({
  value = [],
  onChange,
  label = "Additional Information",
  description = "Store sensitive key-value pairs with encrypted values",
  placeholder = {
    key: "Enter key",
    value: "Enter value",
  },
  className,
  disabled = false,
}: EncryptedKeyValueFormProps) {
  // Convert encrypted pairs to local format for editing
  const localValue: EncryptedKeyValuePair[] =
    value.length === 0
      ? []
      : value.map((pair) => ({
          id: pair.id || `temp_${Date.now()}_${Math.random()}`,
          key: pair.key,
          value: "", // Don't display encrypted values
          encrypted: true,
        }))

  const handleChange = useCallback((newValue: EncryptedKeyValuePair[]) => {
    // For immediate state updates, we only update if there are actual changes
    // The encryption happens in onEncryptedChange
  }, [])

  const handleEncryptedChange = useCallback(
    (encrypted: GenericEncryptedKeyValuePairDto[]) => {
      onChange(encrypted)
    },
    [onChange]
  )

  const getIsProcessing = useCallback((item: EncryptedKeyValuePair) => {
    return item.isEncrypting || false
  }, [])

  return (
    <KeyValuePairManager
      value={localValue}
      onChange={handleChange}
      mode="single"
      persistenceMode="encryption"
      label={label}
      description={description}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      validateDuplicateKeys={true}
      autoEncryptOnBlur={true}
      onEncryptedChange={handleEncryptedChange}
      getIsProcessing={getIsProcessing}
    />
  )
}
