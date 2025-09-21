"use client"

import { useCallback, useEffect, useRef, useState } from "react"
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
        !!pair.id &&
        !pair.id.startsWith("temp_") &&
        !!credentialId
    )

  // Display value logic (pair.value is the single source of truth):
  // - pair.value = "" + existing pair = show "••••••••" (masked, can click eye to reveal)
  // - pair.value = "" + new pair = show "" (empty, ready for input)
  // - pair.value = "something" = show "something" (user typed or fetched value)
  const displayValue = (() => {
    if (pair.value) {
      return pair.value
    }

    if (pair.key && pair.id && !pair.id.startsWith("temp_") && credentialId) {
      return "••••••••"
    }

    return ""
  })()

  // Check if this item is being processed (e.g., encrypting)
  const isProcessing = getIsProcessing?.(pair) || false

  const handleEyeClick = useCallback(() => {
    if (!valueData?.value && !isLoadingValue && credentialId && !isProcessing) {
      setShouldFetchValue(true)
    }
  }, [valueData?.value, isLoadingValue, credentialId, isProcessing])

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      onValueChange(index, newValue)
    },
    [index, onValueChange]
  )

  // Update local state when value is fetched
  useEffect(() => {
    if (valueData?.value && !pair.value) {
      onValueChange(index, valueData.value)
    }
  }, [valueData?.value, pair.value, index, onValueChange])

  // Always in edit mode - no view mode needed
  return (
    <div className="relative">
      <Input
        variant="password-copyable"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleValueChange}
        onBlur={() => onValueBlur?.(index)}
        onEyeClick={handleEyeClick}
        disabled={disabled || isProcessing}
        className="font-mono text-xs"
        autoComplete="new-password"
        aria-label={`Value for pair ${index + 1}`}
        aria-describedby={`value-help-${index}`}
        role="textbox"
      />
      {(isProcessing || isLoadingValue) && (
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
  persistenceMode = "none",
  label = "Key-Value Pairs",
  description = "Manage key-value pair data",
  placeholder = { key: "Enter key", value: "Enter value" },
  validateDuplicateKeys = true,
  disabled = false,
  className,
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

  // Sync with external value changes - but only when necessary to avoid overriding user input
  useEffect(() => {
    // In encryption mode, don't sync with external value changes to avoid overriding user input
    if (persistenceMode === "encryption") {
      return
    }

    // Only sync if the arrays are fundamentally different (length or IDs changed)
    // Don't sync if just values changed (user might be typing)
    const isDifferentStructure =
      value.length !== localPairs.length ||
      value.some((pair, index) => pair.id !== localPairs[index]?.id)

    if (isDifferentStructure) {
      if (value.length === 0) {
        setLocalPairs([{ id: `temp_empty`, key: "", value: "" } as T])
      } else {
        setLocalPairs(value.map((pair) => ({ ...pair })))
      }
    }
  }, [value, persistenceMode])

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
      console.log(`🔐 handleEncryptOnBlur called for index ${index}:`, {
        key: item.key,
        value: item.value ? "***" : "empty",
      })

      // Only validate and encrypt if both key and value have content
      // Don't show error toasts for empty fields during normal editing
      if (!item.key.trim() || !item.value.trim()) {
        console.log(
          `❌ Skipping encryption for index ${index} - missing key or value`
        )
        return
      }

      console.log(
        `✅ Proceeding with encryption for index ${index}, key: "${item.key}"`
      )

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
        console.log(
          `🔐 Encryption complete for "${item.key}". Total encrypted pairs:`,
          updatedEncrypted.length
        )
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
    [value, onEncryptedChange, onChange, toast]
  )

  const handleValueBlur = useCallback(
    async (index: number) => {
      console.log(`👁️ handleValueBlur called for index ${index}`)

      // Get current state atomically to prevent race conditions
      let currentPair: T | null = null

      setLocalPairs((currentPairs) => {
        console.log(
          `👁️ Current pairs in blur handler:`,
          currentPairs.map((p) => ({
            key: p.key,
            value: p.value ? "***" : "empty",
          }))
        )

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

        console.log(`👁️ Found pair for blur at index ${index}:`, {
          key: pair.key,
          value: pair.value ? "***" : "empty",
        })
        currentPair = pair
        return currentPairs // Don't change state here
      })

      // Auto-encrypt on blur if enabled
      console.log(`👁️ Checking encryption conditions:`, {
        currentPair: !!currentPair,
        autoEncryptOnBlur,
        persistenceMode,
        shouldEncrypt:
          currentPair && autoEncryptOnBlur && persistenceMode === "encryption",
      })

      if (
        currentPair &&
        autoEncryptOnBlur &&
        persistenceMode === "encryption"
      ) {
        console.log(`✅ Calling handleEncryptOnBlur for index ${index}`)
        await handleEncryptOnBlur(currentPair, index)
      } else {
        console.log(`❌ Not calling encryption for index ${index}`)
      }
    },
    [autoEncryptOnBlur, persistenceMode, handleEncryptOnBlur]
  )

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Allow users to add new pairs with Ctrl+Enter
      if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault()
        handleAddPair()
      }
    },
    [handleAddPair]
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
                    Enter the value for this pair. Values are encrypted when
                    saved.
                  </div>
                  <ValueInput
                    pair={pair}
                    index={index}
                    credentialId={credentialId}
                    placeholder={placeholder.value}
                    disabled={disabled}
                    onValueChange={handleValueChange}
                    getIsProcessing={getIsProcessing}
                    onValueBlur={handleValueBlur}
                  />
                </div>
              </div>

              {localPairs.length > 1 && (
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
        </div>
      </div>
    </div>
  )
}

// Convenience export for encrypted key-value form (legacy compatibility)
export interface EncryptedKeyValueFormProps {
  value?: Array<{ id: string; key: string; value: string }>
  onChange: (value: Array<{ id: string; key: string; value: string }>) => void
  label?: string
  description?: string
  placeholder?: {
    key: string
    value: string
  }
  className?: string
  disabled?: boolean
}

export function EncryptedKeyValueForm({
  value = [],
  onChange,
  label = "Additional Information",
  placeholder = {
    key: "Enter key",
    value: "Enter value",
  },
  className,
  disabled = false,
}: EncryptedKeyValueFormProps) {
  return (
    <KeyValuePairManager
      value={value}
      onChange={onChange}
      label={label}
      description="Store sensitive key-value pairs with encrypted values"
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      validateDuplicateKeys={true}
      persistenceMode="none"
    />
  )
}
