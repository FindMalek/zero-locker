import { secretSimpleOutputSchema } from "@/schemas/secrets"
import { z } from "zod"

import { containerSimpleOutputSchema } from "../output"

// ============================================================================
// Create With Secrets Output Schema
// ============================================================================

export const createWithSecretsOutputSchema = z.object({
  success: z.boolean(),
  container: containerSimpleOutputSchema.optional(),
  secrets: z.array(secretSimpleOutputSchema).optional(),
  error: z.string().optional(),
})

export type CreateWithSecretsOutput = z.infer<
  typeof createWithSecretsOutputSchema
>
