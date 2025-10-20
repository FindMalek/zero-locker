import { genericEncryptedKeyValuePairInputSchema } from "@/schemas/encryption"
import { z } from "zod"

// ============================================================================
// Base Input Schema
// ============================================================================

export const keyValueInputSchema =
  genericEncryptedKeyValuePairInputSchema.extend({
    credentialMetadataId: z.string().optional(),
  })

export type KeyValueInput = z.infer<typeof keyValueInputSchema>

// ============================================================================
// Backward Compatibility Aliases (DEPRECATED)
// ============================================================================

/** @deprecated Use keyValueInputSchema instead */
export const credentialKeyValuePairDtoSchema = keyValueInputSchema
/** @deprecated Use KeyValueInput instead */
export type CredentialKeyValuePairDto = KeyValueInput
