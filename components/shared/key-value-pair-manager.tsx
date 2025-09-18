"use client"

import { useCallback, useEffect, useState } from "react"
import { useCredentialKeyValuePairValue } from "@/orpc/hooks/use-credentials"
import { GenericEncryptedKeyValuePairDto } from "@/schemas/encryption/encryption"

import {
  encryptData,
  exportKey,
  generateEncryptionKey,
  generateSecureId,
} from "@/lib/encryption"
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
  createdAt?: Date
  updatedAt?: Date
  encrypted?: boolean
  isEncrypting?: boolean
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
          aria-label={`Value for pair ${index + 1}`}
          aria-describedby={`value-help-${index}`}
          role="textbox"
        />
        {isProcessing && (
          <div
            className="absolute inset-y-0 right-3 flex items-center"
            aria-hidden="true"
          >
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
        aria-label={`Value for pair ${index + 1} (masked)`}
        aria-describedby={`value-help-${index}`}
        role="textbox"
        aria-readonly="true"
      />
      {(isLoadingValue || isProcessing) && (
        <div
          className="absolute inset-y-0 right-16 flex items-center"
          aria-hidden="true"
        >
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

      // Use functional update to get current state atomically
      let validationResult = true
      setLocalPairs((currentPairs) => {
        const isDuplicate = currentPairs.some(
          (pair, i) =>
            i !== currentIndex &&
            pair.key.trim().toLowerCase() === trimmedKey.toLowerCase()
        )

        if (isDuplicate) {
          toast(
            "A key with this name already exists. Please use a unique key name.",
            "error"
          )
          validationResult = false
        }

        return currentPairs // Don't actually change state, just check
      })

      return validationResult
    },
    [validateDuplicateKeys, toast]
  )

  const handleAddPair = useCallback(() => {
    // Atomic state update to prevent race conditions
    setLocalPairs((currentPairs) => {
      const newPair = {
        id: generateSecureId("temp"),
        key: "",
        value: "",
      } as T
      const updated = [...currentPairs, newPair]

      // Trigger onChange with the new state
      onChange(updated)
      return updated
    })
  }, [onChange])

  const handleRemovePair = useCallback(
    (index: number) => {
      // Atomic state update to prevent race conditions
      setLocalPairs((currentPairs) => {
        // Bounds checking with current state
        if (index < 0 || index >= currentPairs.length) {
          console.warn(
            `Invalid remove index: ${index}, array length: ${currentPairs.length}`
          )
          return currentPairs
        }

        const updated = currentPairs.filter((_, i) => i !== index)

        // Trigger onChange with the new state
        onChange(updated)
        return updated
      })
    },
    [onChange]
  )

  const handleKeyChange = useCallback(
    (index: number, newKey: string) => {
      // Atomic state update to prevent race conditions
      setLocalPairs((currentPairs) => {
        // Bounds checking with current state
        if (index < 0 || index >= currentPairs.length) {
          console.warn(
            `Invalid key change index: ${index}, array length: ${currentPairs.length}`
          )
          return currentPairs
        }

        const updated = currentPairs.map((pair, i) =>
          i === index ? { ...pair, key: newKey } : pair
        )

        // Trigger onChange with the new state
        onChange(updated)
        return updated
      })
    },
    [onChange]
  )

  const handleValueChange = useCallback(
    (index: number, newValue: string) => {
      // Atomic state update to prevent race conditions
      setLocalPairs((currentPairs) => {
        // Bounds checking with current state
        if (index < 0 || index >= currentPairs.length) {
          console.warn(
            `Invalid value change index: ${index}, array length: ${currentPairs.length}`
          )
          return currentPairs
        }

        const updated = currentPairs.map((pair, i) =>
          i === index ? { ...pair, value: newValue } : pair
        )

        // Trigger onChange with the new state
        onChange(updated)
        return updated
      })
    },
    [onChange]
  )

  const handleKeyBlur = useCallback(
    (index: number) => {
      // Use atomic access to current state
      setLocalPairs((currentPairs) => {
        // Bounds checking with current state
        if (index < 0 || index >= currentPairs.length) {
          console.warn(
            `Invalid key blur index: ${index}, array length: ${currentPairs.length}`
          )
          return currentPairs
        }

        const pair = currentPairs[index]
        if (!pair) {
          console.warn(`No pair found at index ${index}`)
          return currentPairs
        }

        if (!validateKey(pair.key, index)) {
          // Reset key on validation failure - atomic update
          return currentPairs.map((p, i) =>
            i === index ? { ...p, key: "" } : p
          )
        }

        return currentPairs // No changes needed
      })
    },
    [validateKey]
  )

  // Handle encryption on blur for encryption mode
  const handleEncryptOnBlur = useCallback(
    async (item: T, index: number) => {
      if (!item.key.trim()) {
        toast("Key cannot be empty", "error")
        return
      }

      if (!item.value.trim()) {
        toast("Value cannot be empty", "error")
        return
      }

      if (!onEncryptedChange) {
        console.warn("No encryption handler provided for encryption mode")
        return
      }

      try {
        // Set encrypting state atomically
        setLocalPairs((currentPairs) =>
          currentPairs.map((pair, i) =>
            i === index ? ({ ...pair, isEncrypting: true } as T) : pair
          )
        )

        // Generate encryption key and encrypt value
        const key = await generateEncryptionKey()
        const encryptResult = await encryptData(item.value, key)

        // Validate key is CryptoKey before export
        if (!key || typeof key !== "object" || !("type" in key)) {
          throw new Error("Invalid encryption key generated")
        }
        const keyString = await exportKey(key)

        const encryptedPair: GenericEncryptedKeyValuePairDto = {
          id: item.id?.startsWith("temp_")
            ? generateSecureId("kv")
            : item.id || generateSecureId("kv"),
          key: item.key,
          valueEncryption: {
            encryptedValue: encryptResult.encryptedData,
            iv: encryptResult.iv,
            encryptionKey: keyString,
          },
        }

        // Get current encrypted values - only relevant in encryption mode
        const currentEncrypted = Array.isArray(value)
          ? (value as unknown as GenericEncryptedKeyValuePairDto[]).filter(
              (pair) => pair?.valueEncryption && pair.id !== item.id
            )
          : []

        // Add or update the encrypted pair
        const updatedEncrypted = [...currentEncrypted, encryptedPair]
        onEncryptedChange(updatedEncrypted)

        // Clear the local value but keep the key - atomic state update
        setLocalPairs((currentPairs) => {
          const clearedLocal = currentPairs.map((pair, i) =>
            i === index
              ? ({ ...pair, value: "", isEncrypting: false } as T)
              : pair
          )

          // Trigger onChange with the new state
          onChange(clearedLocal)
          return clearedLocal
        })
      } catch (error) {
        // Log error without sensitive details - only the error type for debugging
        if (process.env.NODE_ENV === "development") {
          console.error(
            "Encryption failed:",
            error instanceof Error ? error.message : "Unknown error"
          )
        }
        toast("Failed to encrypt value", "error")

        // Reset encrypting state atomically
        setLocalPairs((currentPairs) =>
          currentPairs.map((pair, i) =>
            i === index ? ({ ...pair, isEncrypting: false } as T) : pair
          )
        )
      }
    },
    [localPairs, value, onEncryptedChange, onChange, toast]
  )

  const handleValueBlur = useCallback(
    async (index: number) => {
      // Get current state atomically to prevent race conditions
      let currentPair: T | null = null

      setLocalPairs((currentPairs) => {
        // Bounds checking with current state
        if (index < 0 || index >= currentPairs.length) {
          console.warn(
            `Invalid value blur index: ${index}, array length: ${currentPairs.length}`
          )
          return currentPairs
        }

        const pair = currentPairs[index]
        if (!pair) {
          console.warn(`No pair found at index ${index}`)
          return currentPairs
        }

        currentPair = pair
        return currentPairs // Don't change state here
      })

      // Auto-encrypt on blur if enabled
      if (
        currentPair &&
        autoEncryptOnBlur &&
        persistenceMode === "encryption"
      ) {
        await handleEncryptOnBlur(currentPair, index)
      }
    },
    [autoEncryptOnBlur, persistenceMode, handleEncryptOnBlur]
  )

  // Determine current mode state
  const shouldShowEditMode =
    mode === "single" || (mode === "edit-view" && isEditing)

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Allow users to add new pairs with Ctrl+Enter
      if (event.ctrlKey && event.key === "Enter" && shouldShowEditMode) {
        event.preventDefault()
        handleAddPair()
      }
    },
    [shouldShowEditMode, handleAddPair]
  )

  return (
    <div className={cn("space-y-2", className)} onKeyDown={handleKeyDown}>
      {/* Screen reader description */}
      <div id="kv-pairs-description" className="sr-only">
        {description}. Use Tab to navigate between fields. Use Ctrl+Enter to add
        a new pair in edit mode.
      </div>

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
              aria-label="Edit key-value pairs"
              title="Edit existing key-value pairs"
            >
              <Icons.pencil className="mr-1 size-3" aria-hidden="true" />
              Edit
            </Button>
          )}
      </div>

      {/* Content */}
      <div
        className="overflow-hidden rounded-lg border"
        role="region"
        aria-label={`${label} data entry form`}
      >
        <div
          className="space-y-0"
          role="group"
          aria-describedby="kv-pairs-description"
        >
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
                  <div id={`key-help-${index}`} className="sr-only">
                    Enter a unique key name for this pair. Keys must be unique
                    within the form.
                  </div>
                  <Input
                    placeholder={placeholder.key}
                    value={pair.key}
                    onChange={(e) => handleKeyChange(index, e.target.value)}
                    onBlur={() => handleKeyBlur(index)}
                    readOnly={!shouldShowEditMode}
                    disabled={disabled}
                    className="font-mono text-xs"
                    autoComplete="off"
                    aria-label={`Key for pair ${index + 1}`}
                    aria-describedby={`key-help-${index}`}
                    role="textbox"
                  />
                </div>
                <div>
                  {index === 0 && (
                    <Label className="text-muted-foreground mb-2 block text-xs uppercase tracking-wide">
                      Value
                    </Label>
                  )}
                  <div id={`value-help-${index}`} className="sr-only">
                    {shouldShowEditMode
                      ? "Enter the value for this pair. Values are encrypted when saved."
                      : "This value is masked for security. Click the eye icon to reveal it."}
                  </div>
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
                    aria-label={`Remove key-value pair ${index + 1}`}
                    title={`Remove pair ${index + 1}`}
                  >
                    <Icons.trash className="size-4" aria-hidden="true" />
                    <span className="sr-only">Remove pair</span>
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
                aria-label="Add another key-value pair"
                title="Add another key-value pair"
              >
                <Icons.add className="size-4" aria-hidden="true" />
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
  const localValue: BaseKeyValuePair[] =
    value.length === 0
      ? []
      : value.map((pair) => ({
          id: pair.id || generateSecureId("temp"),
          key: pair.key,
          value: "", // Don't display encrypted values
          encrypted: true,
        }))

  // No need for handleChange - encryption happens on blur, not on every keystroke

  const handleEncryptedChange = useCallback(
    (encrypted: GenericEncryptedKeyValuePairDto[]) => {
      onChange(encrypted)
    },
    [onChange]
  )

  const getIsProcessing = useCallback((item: BaseKeyValuePair) => {
    return item.isEncrypting || false
  }, [])

  return (
    <KeyValuePairManager
      value={localValue}
      onChange={() => {}} // Encryption mode doesn't need immediate onChange
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
