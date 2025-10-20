import { z } from "zod"

// ============================================================================
// Encryption Input Schemas
// ============================================================================

export const encryptedDataDtoSchema = z.object({
  iv: z.string().min(1, "IV is required"),
  encryptedValue: z.string().min(1, "Encrypted value is required"),
  encryptionKey: z.string().min(1, "Encryption key is required"),
})

export type EncryptedDataDto = z.infer<typeof encryptedDataDtoSchema>

// ============================================================================
// Generic Encrypted Key-Value Pair Input Schema
// ============================================================================

export const genericEncryptedKeyValuePairDtoSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(1, "Key is required"),
  valueEncryption: encryptedDataDtoSchema,
})

export type GenericEncryptedKeyValuePairDto = z.infer<
  typeof genericEncryptedKeyValuePairDtoSchema
>
