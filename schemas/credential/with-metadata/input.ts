import { z } from "zod"

import { createCredentialInputSchema } from "../input"
import { metadataInputSchema } from "../metadata/input"

// ============================================================================
// Create With Metadata Input Schema
// ============================================================================

export const createWithMetadataInputSchema = z.object({
  credential: createCredentialInputSchema,
  metadata: metadataInputSchema.optional(),
})

export type CreateWithMetadataInput = z.infer<
  typeof createWithMetadataInputSchema
>
