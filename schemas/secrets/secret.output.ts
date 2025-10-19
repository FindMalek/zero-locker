import { z } from "zod"

// ============================================================================
// Simple Return Object (RO)
// ============================================================================

export const secretSimpleOutputSchema = z.object({
  id: z.string(),

  name: z.string(),
  note: z.string().nullable(),

  lastViewed: z.date().nullable(),
  updatedAt: z.date(),
  createdAt: z.date(),

  userId: z.string(),
  containerId: z.string(),
  valueEncryptionId: z.string(),
})

export type SecretSimpleOutput = z.infer<typeof secretSimpleOutputSchema>

// ============================================================================
// List Response Output Schema
// ============================================================================

export const listSecretsOutputSchema = z.object({
  secrets: z.array(secretSimpleOutputSchema),
  total: z.number().int(),
  hasMore: z.boolean(),
  page: z.number().int(),
  limit: z.number().int(),
})

export type ListSecretsOutput = z.infer<typeof listSecretsOutputSchema>

// ============================================================================
// Backward Compatibility Aliases (DEPRECATED - use new names)
// ============================================================================

/** @deprecated Use secretSimpleOutputSchema instead */
export const secretSimpleRoSchema = secretSimpleOutputSchema
/** @deprecated Use SecretSimpleOutput instead */
export type SecretSimpleRo = SecretSimpleOutput

/** @deprecated Use secretSimpleOutputSchema instead */
export const secretOutputSchema = secretSimpleOutputSchema
/** @deprecated Use SecretSimpleOutput instead */
export type SecretOutput = SecretSimpleOutput
