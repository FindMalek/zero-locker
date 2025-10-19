import { secretSimpleOutputSchema } from "@/schemas/secrets"
import { z } from "zod"

import { simpleOutputSchema } from "../output"

// ============================================================================
// Create With Secrets Output Schema
// ============================================================================

export const createWithSecretsOutputSchema = z.object({
  success: z.boolean(),
  container: simpleOutputSchema.optional(),
  secrets: z.array(secretSimpleOutputSchema).optional(),
  error: z.string().optional(),
})

export type CreateWithSecretsOutput = z.infer<
  typeof createWithSecretsOutputSchema
>

// ============================================================================
// Backward Compatibility Aliases (DEPRECATED)
// ============================================================================

/** @deprecated Use createWithSecretsOutputSchema instead */
export const createContainerWithSecretsOutputSchema =
  createWithSecretsOutputSchema
/** @deprecated Use CreateWithSecretsOutput instead */
export type CreateContainerWithSecretsOutput = CreateWithSecretsOutput

