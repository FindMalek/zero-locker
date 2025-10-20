import { encryptedDataDtoSchema } from "@/schemas/encryption"
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

  valueEncryption: encryptedDataDtoSchema,
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

// ============================================================================
// Backward Compatibility Aliases (DEPRECATED)
// ============================================================================

/** @deprecated Use keyValueSimpleOutputSchema instead */
export const credentialKeyValuePairSimpleRoSchema = keyValueSimpleOutputSchema
/** @deprecated Use KeyValueSimpleOutput instead */
export type CredentialKeyValuePairSimpleRo = KeyValueSimpleOutput

/** @deprecated Use keyValueWithEncryptionOutputSchema instead */
export const credentialKeyValuePairWithEncryptionRoSchema =
  keyValueWithEncryptionOutputSchema
/** @deprecated Use KeyValueWithEncryptionOutput instead */
export type CredentialKeyValuePairWithEncryptionRo =
  KeyValueWithEncryptionOutput

/** @deprecated Use keyValueWithValueOutputSchema instead */
export const credentialKeyValuePairWithValueRoSchema =
  keyValueWithValueOutputSchema
/** @deprecated Use KeyValueWithValueOutput instead */
export type CredentialKeyValuePairWithValueRo = KeyValueWithValueOutput
