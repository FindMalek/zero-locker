import { encryptedDataInputSchema } from "@/schemas/encryption"
import { z } from "zod"

import { createInputSchema } from "../input"

// ============================================================================
// Create With Secrets Input Schema
// ============================================================================

export const createWithSecretsInputSchema = z.object({
  container: createInputSchema,
  secrets: z.array(
    z.object({
      name: z.string().min(1, "Secret name is required"),
      note: z.string().optional(),
      valueEncryption: encryptedDataInputSchema,
    })
  ),
})

export type CreateWithSecretsInput = z.infer<
  typeof createWithSecretsInputSchema
>

// ============================================================================
// Backward Compatibility Aliases (DEPRECATED)
// ============================================================================

/** @deprecated Use createWithSecretsInputSchema instead */
export const createContainerWithSecretsInputSchema =
  createWithSecretsInputSchema
/** @deprecated Use CreateWithSecretsInput instead */
export type CreateContainerWithSecretsInput = CreateWithSecretsInput
