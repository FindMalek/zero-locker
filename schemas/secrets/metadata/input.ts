import { SecretStatus, SecretType } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// Secret Metadata Input Schemas
// ============================================================================

export const secretMetadataInputSchema = z.object({
  type: z.nativeEnum(SecretType),
  status: z.nativeEnum(SecretStatus),
  expiresAt: z.date().optional(),
  otherInfo: z.array(z.any()),
  secretId: z.string(),
})

export type SecretMetadataInput = z.infer<typeof secretMetadataInputSchema>

// ============================================================================
// CRUD Operation Input Schemas
// ============================================================================

// Create
export const createSecretMetadataInputSchema = secretMetadataInputSchema

export type CreateSecretMetadataInput = z.infer<typeof createSecretMetadataInputSchema>

// Get by Secret ID
export const getSecretMetadataInputSchema = z.object({
  secretId: z.string().min(1, "Secret ID is required"),
})

export type GetSecretMetadataInput = z.infer<typeof getSecretMetadataInputSchema>

// Update
export const updateSecretMetadataInputSchema = z.object({
  id: z.string().min(1, "Metadata ID is required"),
  data: secretMetadataInputSchema.partial(),
})

export type UpdateSecretMetadataInput = z.infer<typeof updateSecretMetadataInputSchema>

// Delete
export const deleteSecretMetadataInputSchema = z.object({
  id: z.string().min(1, "Metadata ID is required"),
})

export type DeleteSecretMetadataInput = z.infer<typeof deleteSecretMetadataInputSchema>

// List
export const listSecretMetadataInputSchema = z.object({
  secretId: z.string().min(1, "Secret ID is required"),
})

export type ListSecretMetadataInput = z.infer<typeof listSecretMetadataInputSchema>

// ============================================================================
// Legacy aliases for backward compatibility
// ============================================================================

export const secretMetadataDtoSchema = secretMetadataInputSchema
export const inputSchema = secretMetadataInputSchema

export type SecretMetadataDto = SecretMetadataInput
export type Input = SecretMetadataInput
