import { z } from "zod"

// ============================================================================
// Encryption Output Schemas
// ============================================================================

export const encryptedDataSimpleOutputSchema = z.object({
  id: z.string(),
  iv: z.string(),
  encryptionKey: z.string(),
  encryptedValue: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type EncryptedDataSimpleOutput = z.infer<
  typeof encryptedDataSimpleOutputSchema
>

// ============================================================================
// Extended Output Schemas
// ============================================================================

export const encryptedDataOutputSchema = encryptedDataSimpleOutputSchema

export type EncryptedDataOutput = EncryptedDataSimpleOutput

// ============================================================================
// Legacy aliases for backward compatibility
// ============================================================================

export const encryptedDataSimpleRoSchema = encryptedDataSimpleOutputSchema
export const simpleOutputSchema = encryptedDataSimpleOutputSchema
export const outputSchema = encryptedDataSimpleOutputSchema

export type EncryptedDataSimpleRo = EncryptedDataSimpleOutput
export type SimpleOutput = EncryptedDataSimpleOutput
export type Output = EncryptedDataSimpleOutput
