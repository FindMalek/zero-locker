"use client"

import React, { useCallback, useState } from "react"
import { orpc } from "@/orpc/client"
import { credentialKeys } from "@/orpc/hooks/use-credentials"
import { type BaseKeyValuePair } from "@/schemas/utils"
import { useQueryClient } from "@tanstack/react-query"

import { useToast } from "@/hooks/use-toast"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface EncryptedKeyValueDisplayProps<T extends BaseKeyValuePair> {
  value: T[]
  onChange: (value: T[]) => void
  credentialId: string
  label?: string
  placeholder?: {
    key: string
    value: string
  }
  disabled?: boolean
  className?: string
  validateDuplicateKeys?: boolean
}

interface DecryptedValueState {
  value: string
}

export function EncryptedKeyValueDisplay<T extends BaseKeyValuePair>({
  value = [],
  onChange,
  credentialId,
  label = "Additional Information",
  placeholder = { key: "Enter key", value: "Enter value" },
  disabled = false,
  className,
  validateDuplicateKeys = false,
}: EncryptedKeyValueDisplayProps<T>) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [decryptedValues, setDecryptedValues] = useState<
    Record<string, DecryptedValueState>
  >({})

  const updatePairs = useCallback(
    (newPairs: T[]) => {
      onChange(newPairs)
    },
    [onChange]
  )

  const handleAddPair = useCallback(() => {
    const newPair = {
      key: "",
      value: "",
    } as T
    updatePairs([...value, newPair])
  }, [value, updatePairs])

  const handleRemovePair = useCallback(
    (index: number) => {
      if (index < 0 || index >= value.length) return
      const pair = value[index]

      if (pair.id && decryptedValues[pair.id]) {
        setDecryptedValues((prev) => {
          const newState = { ...prev }
          delete newState[pair.id!]
          return newState
        })
      }

      const updated = value.filter((_, i) => i !== index)
      updatePairs(updated)
    },
    [value, updatePairs, decryptedValues]
  )

  const handleKeyChange = useCallback(
    (index: number, newKey: string) => {
      if (index < 0 || index >= value.length) return

      if (validateDuplicateKeys && newKey.trim()) {
        const isDuplicate = value.some(
          (pair, i) =>
            i !== index &&
            pair.key.trim().toLowerCase() === newKey.trim().toLowerCase()
        )
        if (isDuplicate) {
          return
        }
      }

      const updated = value.map((pair, i) =>
        i === index ? { ...pair, key: newKey } : pair
      )
      updatePairs(updated)
    },
    [value, updatePairs, validateDuplicateKeys]
  )

  const handleValueChange = useCallback(
    (index: number, newValue: string) => {
      if (index < 0 || index >= value.length) return
      const updated = value.map((pair, i) =>
        i === index ? { ...pair, value: newValue } : pair
      )
      updatePairs(updated)
    },
    [value, updatePairs]
  )

  const handleEyeClick = useCallback(
    async (index: number) => {
      const pair = value[index]

      if (!pair?.id || !credentialId || pair.id.startsWith("temp_")) return

      try {
        const queryKey = [
          ...credentialKeys.detail(credentialId),
          "key-value-pair-value",
          pair.id,
        ]

        let result = queryClient.getQueryData<{ value: string }>(queryKey)

        if (!result) {
          result = await queryClient.fetchQuery({
            queryKey,
            queryFn: () =>
              orpc.credentials.getKeyValuePairValue.call({
                credentialId,
                keyValuePairId: pair.id!,
              }),
            staleTime: 0, // Always fetch fresh for security
            gcTime: 0, // Don't cache values
          })
        }

        if (result?.value) {
          setDecryptedValues((prev) => ({
            ...prev,
            [pair.id!]: {
              value: result.value,
            },
          }))
        }
      } catch (error) {
        console.error("Failed to decrypt value:", error)
        toast("Failed to decrypt value. Please try again.", "error")
      }
    },
    [value, credentialId, queryClient, toast]
  )

  const getDisplayValueForPair = useCallback(
    (pair: T) => {
      if (pair.value?.length) {
        return pair.value
      }

      if (pair.id && decryptedValues[pair.id]) {
        return decryptedValues[pair.id].value
      }

      if (pair.id && !pair.id.startsWith("temp_")) {
        return "••••••••"
      }

      return pair.value
    },
    [decryptedValues]
  )

  return (
    <div className={className}>
      <Label className="pb-6 text-sm font-medium">{label}</Label>

      <div className="border-border divide-border divide-y rounded-lg border">
        {value.map((pair, index) => (
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

              {/* Value Field */}
              <div className="relative">
                {index === 0 && (
                  <Label className="text-muted-foreground mb-2 block text-xs uppercase tracking-wide">
                    Value
                  </Label>
                )}
                <div className="flex gap-2">
                  <Input
                    variant="password-copyable"
                    placeholder={placeholder.value}
                    value={getDisplayValueForPair(pair)}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    onEyeClick={
                      pair.id && !pair.id.startsWith("temp_")
                        ? () => handleEyeClick(index)
                        : undefined
                    }
                    disabled={disabled}
                    className="flex-1 font-mono text-xs"
                    autoComplete="new-password"
                  />

                  {/* Remove Button */}
                  {value.length > 1 && (
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

        {/* Add Button */}
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
