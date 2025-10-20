import { encryptedDataInputSchema } from "@/schemas/encryption"
import { z } from "zod"

import { createContainerInputSchema } from "../input"

// ============================================================================
// Create With Secrets Input Schema
// ============================================================================

export const createWithSecretsInputSchema = z.object({
  container: createContainerInputSchema,
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
