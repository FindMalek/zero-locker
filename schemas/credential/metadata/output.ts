import { z } from "zod"

// ============================================================================
// Simple Output Schema
// ============================================================================

export const metadataSimpleOutputSchema = z.object({
  id: z.string(),

  recoveryEmail: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  has2FA: z.boolean(),

  credentialId: z.string(),
})

export type MetadataSimpleOutput = z.infer<typeof metadataSimpleOutputSchema>

// ============================================================================
// Backward Compatibility Aliases (DEPRECATED)
// ============================================================================

/** @deprecated Use metadataSimpleOutputSchema instead */
export const credentialMetadataSimpleRoSchema = metadataSimpleOutputSchema
/** @deprecated Use MetadataSimpleOutput instead */
export type CredentialMetadataSimpleRo = MetadataSimpleOutput


