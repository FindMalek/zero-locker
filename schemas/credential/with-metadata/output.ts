import { z } from "zod"

import { simpleOutputSchema } from "../output"

// ============================================================================
// Create With Metadata Output Schema
// ============================================================================

export const createWithMetadataOutputSchema = z.object({
  success: z.boolean(),
  credential: simpleOutputSchema.optional(),
  error: z.string().optional(),
  issues: z.array(z.string()).optional(),
})

export type CreateWithMetadataOutput = z.infer<
  typeof createWithMetadataOutputSchema
>

// ============================================================================
// Backward Compatibility Aliases (DEPRECATED)
// ============================================================================

/** @deprecated Use createWithMetadataOutputSchema instead */
export const createCredentialWithMetadataOutputSchema =
  createWithMetadataOutputSchema
/** @deprecated Use CreateWithMetadataOutput instead */
export type CreateCredentialWithMetadataOutput = CreateWithMetadataOutput
