import { z } from "zod"

import { createInputSchema } from "../input"
import { metadataInputSchema } from "../metadata/input"

// ============================================================================
// Create With Metadata Input Schema
// ============================================================================

export const createWithMetadataInputSchema = z.object({
  credential: createInputSchema,
  metadata: metadataInputSchema.optional(),
})

export type CreateWithMetadataInput = z.infer<
  typeof createWithMetadataInputSchema
>

// ============================================================================
// Backward Compatibility Aliases (DEPRECATED)
// ============================================================================

/** @deprecated Use createWithMetadataInputSchema instead */
export const createCredentialWithMetadataInputSchema =
  createWithMetadataInputSchema
/** @deprecated Use CreateWithMetadataInput instead */
export type CreateCredentialWithMetadataInput = CreateWithMetadataInput
