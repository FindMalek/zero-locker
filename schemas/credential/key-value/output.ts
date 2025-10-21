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

// ============================================================================
// Credential Security and Key-Value Pair Output Schemas
// ============================================================================

export const credentialSecuritySettingsOutputSchema = z.object({
  passwordProtection: z.boolean(),
  twoFactorAuth: z.boolean(),
  accessLogging: z.boolean(),
})

export type CredentialSecuritySettingsOutput = z.infer<typeof credentialSecuritySettingsOutputSchema>

export const credentialKeyValuePairOutputSchema = z.object({
  id: z.string(),
  key: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type CredentialKeyValuePairOutput = z.infer<typeof credentialKeyValuePairOutputSchema>

export const credentialKeyValuePairWithValueOutputSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type CredentialKeyValuePairWithValueOutput = z.infer<typeof credentialKeyValuePairWithValueOutputSchema>

export const credentialPasswordOutputSchema = z.object({
  password: z.string(),
})

export type CredentialPasswordOutput = z.infer<typeof credentialPasswordOutputSchema>

export const credentialKeyValuePairValueOutputSchema = z.object({
  value: z.string(),
})

export type CredentialKeyValuePairValueOutput = z.infer<typeof credentialKeyValuePairValueOutputSchema>

export const updateCredentialPasswordOutputSchema = z.object({
  success: z.boolean(),
})

export type UpdateCredentialPasswordOutput = z.infer<typeof updateCredentialPasswordOutputSchema>

export const updateCredentialKeyValuePairsOutputSchema = z.object({
  success: z.boolean(),
})

export type UpdateCredentialKeyValuePairsOutput = z.infer<typeof updateCredentialKeyValuePairsOutputSchema>
