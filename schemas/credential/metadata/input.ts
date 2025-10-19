import { z } from "zod"

import { keyValueInputSchema } from "../key-value/input"

// ============================================================================
// Base Input Schema
// ============================================================================

export const metadataInputSchema = z.object({
  recoveryEmail: z.string().email().optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
  has2FA: z.boolean(),

  keyValuePairs: z.array(keyValueInputSchema).optional(),
})

export type MetadataInput = z.infer<typeof metadataInputSchema>

// ============================================================================
// Backward Compatibility Aliases (DEPRECATED)
// ============================================================================

/** @deprecated Use metadataInputSchema instead */
export const credentialMetadataDtoSchema = metadataInputSchema
/** @deprecated Use MetadataInput instead */
export type CredentialMetadataDto = MetadataInput

