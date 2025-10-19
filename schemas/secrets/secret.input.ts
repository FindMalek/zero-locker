import { encryptedDataDtoSchema } from "@/schemas/encryption/encryption"
import { z } from "zod"

import { secretMetadataDtoSchema } from "./secret-metadata"

// ============================================================================
// Base Input Schema
// ============================================================================

export const secretInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  note: z.string().optional(),

  valueEncryption: encryptedDataDtoSchema,
  metadata: z.array(secretMetadataDtoSchema),

  containerId: z.string(),
})

export type SecretInput = z.infer<typeof secretInputSchema>

// ============================================================================
// CRUD Operation Input Schemas
// ============================================================================

// Create
export const createSecretInputSchema = secretInputSchema

export type CreateSecretInput = z.infer<typeof createSecretInputSchema>

// Get by ID
export const getSecretInputSchema = z.object({
  id: z.string().min(1, "Secret ID is required"),
})

export type GetSecretInput = z.infer<typeof getSecretInputSchema>

// Update
export const updateSecretInputSchema = secretInputSchema.partial().extend({
  id: z.string().min(1, "Secret ID is required"),
})

export type UpdateSecretInput = z.infer<typeof updateSecretInputSchema>

// Delete
export const deleteSecretInputSchema = z.object({
  id: z.string().min(1, "Secret ID is required"),
})

export type DeleteSecretInput = z.infer<typeof deleteSecretInputSchema>

// ============================================================================
// List Operation Input Schema
// ============================================================================

export const listSecretsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  containerId: z.string().optional(),
})

export type ListSecretsInput = z.infer<typeof listSecretsInputSchema>

// ============================================================================
// Backward Compatibility Aliases (DEPRECATED - use new names)
// ============================================================================

/** @deprecated Use secretInputSchema instead */
export const secretDtoSchema = secretInputSchema
/** @deprecated Use SecretInput instead */
export type SecretDto = SecretInput

/** @deprecated Use getSecretInputSchema instead */
export const getSecretByIdDtoSchema = getSecretInputSchema
/** @deprecated Use GetSecretInput instead */
export type GetSecretByIdDto = GetSecretInput

/** @deprecated Use updateSecretInputSchema instead */
export const updateSecretDtoSchema = updateSecretInputSchema
/** @deprecated Use UpdateSecretInput instead */
export type UpdateSecretDto = UpdateSecretInput

/** @deprecated Use deleteSecretInputSchema instead */
export const deleteSecretDtoSchema = deleteSecretInputSchema
/** @deprecated Use DeleteSecretInput instead */
export type DeleteSecretDto = DeleteSecretInput
