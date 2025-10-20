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
// CRUD Operation Input Schemas
// ============================================================================

// Create
export const createKeyValuePairInputSchema = keyValueInputSchema

export type CreateKeyValuePairInput = z.infer<
  typeof createKeyValuePairInputSchema
>

// Update
export const updateKeyValuePairInputSchema = z.object({
  id: z.string().min(1, "Key-value pair ID is required"),
  data: keyValueInputSchema.partial(),
})

export type UpdateKeyValuePairInput = z.infer<
  typeof updateKeyValuePairInputSchema
>

// Delete
export const deleteKeyValuePairInputSchema = z.object({
  id: z.string().min(1, "Key-value pair ID is required"),
})

export type DeleteKeyValuePairInput = z.infer<
  typeof deleteKeyValuePairInputSchema
>
