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

// Alias for backward compatibility
export const secretOutputSchema = secretSimpleOutputSchema
export type SecretOutput = SecretSimpleOutput
