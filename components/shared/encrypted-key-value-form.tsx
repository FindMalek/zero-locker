"use client"

import { useCallback } from "react"
import { GenericEncryptedKeyValuePairDto } from "@/schemas/encryption/encryption"
import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"
import { KeyValuePairManager, type BaseKeyValuePair } from "./key-value-pair-manager"

interface LocalKeyValuePair extends BaseKeyValuePair {
  isEncrypting?: boolean
}

interface EncryptedKeyValueFormProps {
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
  const localValue: LocalKeyValuePair[] = value.length === 0 
    ? []
    : value.map((pair) => ({
        id: pair.id || `temp_${Date.now()}_${Math.random()}`,
        key: pair.key,
        value: "", // Don't display encrypted values
      }))

  const handleChange = useCallback((newValue: LocalKeyValuePair[]) => {
    // For immediate state updates, we only update if there are actual changes
    // The encryption happens in handleItemBlur
  }, [])

  const handleItemBlur = useCallback(async (item: LocalKeyValuePair, index: number) => {
    if (!item.key.trim() || !item.value.trim()) {
      return
    }

    try {
      // Generate encryption key and encrypt value
      const key = await generateEncryptionKey()
      const encryptResult = await encryptData(item.value, key)
      const keyString = await exportKey(key as CryptoKey)

      const encryptedPair: GenericEncryptedKeyValuePairDto = {
        id: item.id.startsWith("temp_") ? `kv_${Date.now()}` : item.id,
        key: item.key,
        valueEncryption: {
          encryptedValue: encryptResult.encryptedData,
          iv: encryptResult.iv,
          encryptionKey: keyString,
        },
      }

      // Update the parent with the new encrypted pair
      const existingIndex = value.findIndex((pair) => pair.id === item.id)
      let updatedValue: GenericEncryptedKeyValuePairDto[]

      if (existingIndex >= 0) {
        updatedValue = [...value]
        updatedValue[existingIndex] = encryptedPair
      } else {
        updatedValue = [...value, encryptedPair]
      }

      onChange(updatedValue)
    } catch (error) {
      console.error("Failed to encrypt value:", error)
    }
  }, [value, onChange])

  const getIsProcessing = useCallback((item: LocalKeyValuePair) => {
    return item.isEncrypting || false
  }, [])

  return (
    <KeyValuePairManager
      value={localValue}
      onChange={handleChange}
      mode="single"
      label={label}
      description={description}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      validateDuplicateKeys={true}
      autoProcessOnBlur={true}
      onItemBlur={handleItemBlur}
      getIsProcessing={getIsProcessing}
    />
  )
}
