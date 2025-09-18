import { useCallback, useEffect, useState } from "react"
import { useCredentialKeyValuePairValue } from "@/orpc/hooks/use-credentials"
import { GenericEncryptedKeyValuePairDto } from "@/schemas/encryption/encryption"

import {
  encryptData,
  exportKey,
  generateEncryptionKey,
  generateSecureId,
} from "@/lib/encryption"

import { BaseKeyValuePair } from "@/components/shared/key-value-pair-manager"

interface UseKeyValuePairsOptions<T extends BaseKeyValuePair> {
  initialValue: T[]
  credentialId?: string
  validateDuplicateKeys?: boolean
  autoEncryptOnBlur?: boolean
  onValidationError?: (message: string) => void
  onEncryptedChange?: (encrypted: GenericEncryptedKeyValuePairDto[]) => void
  onError?: (message: string) => void
}

export function useKeyValuePairs<T extends BaseKeyValuePair>({
  initialValue,
  credentialId,
  validateDuplicateKeys = true,
  autoEncryptOnBlur = false,
  onValidationError,
  onEncryptedChange,
  onError,
}: UseKeyValuePairsOptions<T>) {
  // State management
  const [pairs, setPairs] = useState<T[]>(() => {
    if (initialValue.length === 0) {
      return [{ id: `temp_empty`, key: "", value: "" } as T]
    }
    return initialValue.map((pair) => ({ ...pair }))
  })

  // API state
  const [fetchingItems, setFetchingItems] = useState<Set<string>>(new Set())
  const [fetchedValues, setFetchedValues] = useState<Map<string, string>>(
    new Map()
  )

  // Encryption state
  const [encryptingItems, setEncryptingItems] = useState<Set<string>>(new Set())

  // Sync with external value changes
  useEffect(() => {
    if (initialValue.length === 0) {
      setPairs([{ id: `temp_empty`, key: "", value: "" } as T])
    } else {
      setPairs(initialValue.map((pair) => ({ ...pair })))
    }
  }, [initialValue])

  // Validation
  const validateKey = useCallback(
    (key: string, currentIndex: number): boolean => {
      if (!validateDuplicateKeys) return true

      const trimmedKey = key.trim()
      if (!trimmedKey) return true

      const isDuplicate = pairs.some(
        (pair, i) =>
          i !== currentIndex &&
          pair.key.trim().toLowerCase() === trimmedKey.toLowerCase()
      )

      if (isDuplicate) {
        onValidationError?.(
          "A key with this name already exists. Please use a unique key name."
        )
        return false
      }
      return true
    },
    [pairs, validateDuplicateKeys, onValidationError]
  )

  // State operations
  const addPair = useCallback(() => {
    const newPair = {
      id: generateSecureId("temp"),
      key: "",
      value: "",
    } as T
    setPairs((prev) => [...prev, newPair])
  }, [])

  const removePair = useCallback(
    (index: number) => {
      // Bounds checking
      if (index < 0 || index >= pairs.length) {
        return
      }
      setPairs((prev) => prev.filter((_, i) => i !== index))
    },
    [pairs.length]
  )

  const updatePair = useCallback(
    (index: number, updates: Partial<T>) => {
      // Bounds checking
      if (index < 0 || index >= pairs.length) {
        return
      }
      setPairs((prev) =>
        prev.map((pair, i) => (i === index ? { ...pair, ...updates } : pair))
      )
    },
    [pairs.length]
  )

  const updateKey = useCallback(
    (index: number, newKey: string) => {
      if (validateKey(newKey, index)) {
        updatePair(index, { key: newKey } as Partial<T>)
        return true
      }
      return false
    },
    [updatePair, validateKey]
  )

  const updateValue = useCallback(
    (index: number, newValue: string) => {
      updatePair(index, { value: newValue } as Partial<T>)
    },
    [updatePair]
  )

  // API operations
  const isFetching = useCallback(
    (itemId: string): boolean => {
      return fetchingItems.has(itemId)
    },
    [fetchingItems]
  )

  const hasValue = useCallback(
    (itemId: string): boolean => {
      return fetchedValues.has(itemId)
    },
    [fetchedValues]
  )

  const getValue = useCallback(
    (itemId: string): string | undefined => {
      return fetchedValues.get(itemId)
    },
    [fetchedValues]
  )

  const requestFetch = useCallback(
    (itemId: string) => {
      if (!credentialId || !itemId || itemId.startsWith("temp_")) {
        return
      }
      setFetchingItems((prev) => new Set(prev).add(itemId))
    },
    [credentialId]
  )

  const setFetchedValue = useCallback((itemId: string, value: string) => {
    setFetchedValues((prev) => new Map(prev).set(itemId, value))
    setFetchingItems((prev) => {
      const newSet = new Set(prev)
      newSet.delete(itemId)
      return newSet
    })
  }, [])

  // Encryption operations
  const isEncrypting = useCallback(
    (item: T): boolean => {
      return encryptingItems.has(item.id || "")
    },
    [encryptingItems]
  )

  const encryptItem = useCallback(
    async (
      item: T,
      existingEncrypted: GenericEncryptedKeyValuePairDto[] = []
    ) => {
      if (!item.key.trim() || !item.value.trim() || !onEncryptedChange) {
        return { success: false }
      }

      const itemId = item.id || generateSecureId("temp")

      try {
        // Set encrypting state
        setEncryptingItems((prev) => new Set(prev).add(itemId))

        // Generate encryption key and encrypt value
        const key = await generateEncryptionKey()
        const encryptResult = await encryptData(item.value, key)

        // Validate key is CryptoKey before export (browser only)
        if (typeof key === "object" && key && "type" in key) {
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

          // Filter out the current item and add the new encrypted version
          const currentEncrypted = existingEncrypted.filter(
            (pair) => pair.id !== item.id
          )
          const updatedEncrypted = [...currentEncrypted, encryptedPair]

          onEncryptedChange(updatedEncrypted)

          // Clear encrypting state
          setEncryptingItems((prev) => {
            const newSet = new Set(prev)
            newSet.delete(itemId)
            return newSet
          })

          return { success: true, encryptedPair }
        } else {
          throw new Error("Invalid encryption key generated")
        }
      } catch (error) {
        // Clear encrypting state
        setEncryptingItems((prev) => {
          const newSet = new Set(prev)
          newSet.delete(itemId)
          return newSet
        })

        // Log error without sensitive details
        if (process.env.NODE_ENV === "development") {
          console.error(
            "Encryption failed:",
            error instanceof Error ? error.message : "Unknown error"
          )
        }
        onError?.("Failed to encrypt value")

        return { success: false }
      }
    },
    [onEncryptedChange, onError, encryptingItems]
  )

  const clearCache = useCallback(() => {
    setFetchedValues(new Map())
    setFetchingItems(new Set())
  }, [])

  return {
    // State
    pairs,
    setPairs,

    // Operations
    addPair,
    removePair,
    updatePair,
    updateKey,
    updateValue,
    validateKey,

    // API
    isFetching,
    hasValue,
    getValue,
    requestFetch,
    setFetchedValue,
    clearCache,

    // Encryption
    isEncrypting,
    encryptItem,
  }
}
