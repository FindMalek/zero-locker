import { z } from "zod"

// ============================================================================
// Encryption Input Schemas
// ============================================================================

export const encryptedDataInputSchema = z.object({
  iv: z.string().min(1, "IV is required"),
  encryptedValue: z.string().min(1, "Encrypted value is required"),
  encryptionKey: z.string().min(1, "Encryption key is required"),
})

export type EncryptedDataInput = z.infer<typeof encryptedDataInputSchema>

// ============================================================================
// Generic Encrypted Key-Value Pair Input Schema
// ============================================================================

export const genericEncryptedKeyValuePairInputSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(1, "Key is required"),
  valueEncryption: encryptedDataInputSchema,
})

export type GenericEncryptedKeyValuePairInput = z.infer<typeof genericEncryptedKeyValuePairInputSchema>

// ============================================================================
// Legacy aliases for backward compatibility
// ============================================================================

export const encryptedDataDtoSchema = encryptedDataInputSchema
export const genericEncryptedKeyValuePairDtoSchema = genericEncryptedKeyValuePairInputSchema

export type EncryptedDataDto = EncryptedDataInput
export type GenericEncryptedKeyValuePairDto = GenericEncryptedKeyValuePairInput
