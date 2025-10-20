import { z } from "zod"

import { credentialSimpleOutputSchema } from "../output"

// ============================================================================
// Create With Metadata Output Schema
// ============================================================================

export const createWithMetadataOutputSchema = z.object({
  success: z.boolean(),
  credential: credentialSimpleOutputSchema.optional(),
  error: z.string().optional(),
  issues: z.array(z.string()).optional(),
})

export type CreateWithMetadataOutput = z.infer<
  typeof createWithMetadataOutputSchema
>
