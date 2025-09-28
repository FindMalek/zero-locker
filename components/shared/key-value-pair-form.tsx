"use client"

import { useCallback, useEffect, useState } from "react"
import { type BaseKeyValuePair } from "@/schemas/utils"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface KeyValuePairFormProps<T extends BaseKeyValuePair> {
  value: T[]
  onChange: (value: T[]) => void
  label?: string
  placeholder?: {
    key: string
    value: string
  }
  disabled?: boolean
  className?: string
  validateDuplicateKeys?: boolean
  showPasswordField?: boolean
}

export function KeyValuePairForm<T extends BaseKeyValuePair>({
  value = [],
  onChange,
  label = "Key-Value Pairs",
  placeholder = { key: "Enter key", value: "Enter value" },
  disabled = false,
  className,
  validateDuplicateKeys = false,
  showPasswordField = false,
}: KeyValuePairFormProps<T>) {
  const [localPairs, setLocalPairs] = useState<T[]>(() =>
    value.length > 0 ? value : [{ key: "", value: "" } as T]
  )

  useEffect(() => {
    if (value.length === 0) {
      setLocalPairs([{ key: "", value: "" } as T])
    } else {
      setLocalPairs(value)
    }
  }, [value])

  const updatePairs = useCallback(
    (newPairs: T[]) => {
      setLocalPairs(newPairs)
      onChange(newPairs)
    },
    [onChange]
  )

  const handleAddPair = useCallback(() => {
    const newPair = { key: "", value: "" } as T
    updatePairs([...localPairs, newPair])
  }, [localPairs, updatePairs])

  const handleRemovePair = useCallback(
    (index: number) => {
      if (index < 0 || index >= localPairs.length) return
      const updated = localPairs.filter((_, i) => i !== index)
      updatePairs(updated)
    },
    [localPairs, updatePairs]
  )

  const handleKeyChange = useCallback(
    (index: number, newKey: string) => {
      if (index < 0 || index >= localPairs.length) return

      // Validate duplicate keys if enabled
      if (validateDuplicateKeys && newKey.trim()) {
        const isDuplicate = localPairs.some(
          (pair, i) =>
            i !== index &&
            pair.key.trim().toLowerCase() === newKey.trim().toLowerCase()
        )
        if (isDuplicate) {
          // Could add toast notification here
          return
        }
      }

      const updated = localPairs.map((pair, i) =>
        i === index ? { ...pair, key: newKey } : pair
      )
      updatePairs(updated)
    },
    [localPairs, updatePairs, validateDuplicateKeys]
  )

  const handleValueChange = useCallback(
    (index: number, newValue: string) => {
      if (index < 0 || index >= localPairs.length) return
      const updated = localPairs.map((pair, i) =>
        i === index ? { ...pair, value: newValue } : pair
      )
      updatePairs(updated)
    },
    [localPairs, updatePairs]
  )

  return (
    <div className={className}>
      <Label className="pb-6 text-sm font-medium">{label}</Label>

      <div className="border-border divide-border divide-y rounded-lg border">
        {localPairs.map((pair, index) => (
          <div key={pair.id || index} className="p-3 sm:p-4">
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
              {/* Key Field */}
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
                  disabled={disabled}
                  className="font-mono text-xs"
                  autoComplete="off"
                />
              </div>

              {/* Value Field */}
              <div className="relative">
                {index === 0 && (
                  <Label className="text-muted-foreground mb-2 block text-xs uppercase tracking-wide">
                    Value
                  </Label>
                )}
                <div className="flex gap-2">
                  <Input
                    variant={
                      showPasswordField ? "password-copyable" : "default"
                    }
                    placeholder={placeholder.value}
                    value={pair.value}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    disabled={disabled}
                    className="flex-1 font-mono text-xs"
                    autoComplete={showPasswordField ? "new-password" : "off"}
                  />

                  {/* Remove Button */}
                  {localPairs.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePair(index)}
                      disabled={disabled}
                      className="text-muted-foreground hover:text-destructive flex-shrink-0"
                    >
                      <Icons.trash className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
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
          >
            <Icons.add className="size-4" />
            Add Another
          </Button>
        </div>
      </div>
    </div>
  )
}
