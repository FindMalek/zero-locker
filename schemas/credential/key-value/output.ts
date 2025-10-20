import { encryptedDataInputSchema } from "@/schemas/encryption"
import { z } from "zod"

// ============================================================================
// Simple Output Schema
// ============================================================================

export const keyValueSimpleOutputSchema = z.object({
  id: z.string(),

  key: z.string(),
  valueEncryptionId: z.string(),
  credentialMetadataId: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),
})

export type KeyValueSimpleOutput = z.infer<typeof keyValueSimpleOutputSchema>

// ============================================================================
// With Encryption Output Schema
// ============================================================================

export const keyValueWithEncryptionOutputSchema = z.object({
  id: z.string(),
  key: z.string(),

  valueEncryption: encryptedDataInputSchema,
  credentialMetadataId: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),
})

export type KeyValueWithEncryptionOutput = z.infer<
  typeof keyValueWithEncryptionOutputSchema
>

// ============================================================================
// With Value Output Schema
// ============================================================================

export const keyValueWithValueOutputSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type KeyValueWithValueOutput = z.infer<
  typeof keyValueWithValueOutputSchema
>
