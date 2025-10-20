import { genericEncryptedKeyValuePairInputSchema } from "@/schemas/encryption"
import { z } from "zod"

// Base key-value schema for metadata (without credentialMetadataId to avoid circular dependency)
const metadataKeyValueInputSchema = genericEncryptedKeyValuePairInputSchema

// ============================================================================
// Base Input Schema
// ============================================================================

export const metadataInputSchema = z.object({
  recoveryEmail: z.string().email().optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
  has2FA: z.boolean(),

  keyValuePairs: z.array(metadataKeyValueInputSchema).optional(),
})

export type MetadataInput = z.infer<typeof metadataInputSchema>

// ============================================================================
// CRUD Operation Input Schemas
// ============================================================================

// Create
export const createMetadataInputSchema = metadataInputSchema

export type CreateMetadataInput = z.infer<typeof createMetadataInputSchema>

// Get by Credential ID
export const getMetadataInputSchema = z.object({
  credentialId: z.string().min(1, "Credential ID is required"),
})

export type GetMetadataInput = z.infer<typeof getMetadataInputSchema>

// Update
export const updateMetadataInputSchema = z.object({
  id: z.string().min(1, "Metadata ID is required"),
  data: metadataInputSchema.partial(),
})

export type UpdateMetadataInput = z.infer<typeof updateMetadataInputSchema>

// Delete
export const deleteMetadataInputSchema = z.object({
  id: z.string().min(1, "Metadata ID is required"),
})

export type DeleteMetadataInput = z.infer<typeof deleteMetadataInputSchema>

// List
export const listMetadataInputSchema = z.object({
  credentialId: z.string().min(1, "Credential ID is required"),
})

export type ListMetadataInput = z.infer<typeof listMetadataInputSchema>
