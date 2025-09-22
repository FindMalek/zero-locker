"use client"

import { useCallback, useEffect, useState } from "react"
import { type BaseKeyValuePair } from "@/schemas/utils"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type PersistenceMode = "api" | "encryption" | "none"

export interface KeyValuePairManagerProps<T extends BaseKeyValuePair> {
  value: T[]
  onChange: (value: T[]) => void
  persistenceMode?: PersistenceMode
  label?: string
  description?: string
  placeholder?: {
    key: string
    value: string
  }
  validateDuplicateKeys?: boolean
  disabled?: boolean
  className?: string
  credentialId?: string
  onEncryptedChange?: (value: unknown[]) => void
  autoEncryptOnBlur?: boolean
  getIsProcessing?: (item: T) => boolean
}

export function KeyValuePairManager<T extends BaseKeyValuePair>({
  value = [],
  onChange,
  label = "Key-Value Pairs",
  description,
  placeholder = { key: "Enter key", value: "Enter value" },
  disabled = false,
  className,
}: KeyValuePairManagerProps<T>) {
  const [localPairs, setLocalPairs] = useState<T[]>(() =>
    value.length > 0 ? value : [{ key: "", value: "" } as T]
  )

  useEffect(() => {
    if (
      value.length !== localPairs.length ||
      value.some((pair, index) => pair.id !== localPairs[index]?.id)
    ) {
      setLocalPairs(value.length === 0 ? [{ key: "", value: "" } as T] : value)
    }
  }, [value, localPairs.length, localPairs])

  const handleAddPair = useCallback(() => {
    const newPair = { key: "", value: "" } as T
    setLocalPairs((prev) => [...prev, newPair])
    onChange([...localPairs, newPair])
  }, [localPairs, onChange])

  const handleRemovePair = useCallback(
    (index: number) => {
      if (index < 0 || index >= localPairs.length) return
      const updated = localPairs.filter((_, i) => i !== index)
      setLocalPairs(updated)
      onChange(updated)
    },
    [localPairs, onChange]
  )

  const handleKeyChange = useCallback(
    (index: number, newKey: string) => {
      if (index < 0 || index >= localPairs.length) return
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
      if (index < 0 || index >= localPairs.length) return
      const updated = localPairs.map((pair, i) =>
        i === index ? { ...pair, value: newValue } : pair
      )
      setLocalPairs(updated)
      onChange(updated)
    },
    [localPairs, onChange]
  )

  return (
    <div className={className}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-muted-foreground text-xs">{description}</p>
        )}
      </div>

      <div className="border-border divide-border divide-y rounded-lg border">
        {localPairs.map((pair, index) => (
          <div key={pair.id || index} className="p-3 sm:p-4">
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
                <Input
                  variant="password-copyable"
                  placeholder={placeholder.value}
                  value={pair.value}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                  disabled={disabled}
                  className="font-mono text-xs"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {localPairs.length > 1 && (
              <div className="mt-2 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePair(index)}
                  disabled={disabled}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Icons.trash className="size-4" />
                  Remove
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
          >
            <Icons.add className="size-4" />
            Add Another
          </Button>
        </div>
      </div>
    </div>
  )
}
