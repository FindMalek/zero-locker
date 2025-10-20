import { encryptedDataInputSchema } from "@/schemas/encryption"
import { z } from "zod"

import { secretMetadataInputSchema } from "./metadata/input"

// ============================================================================
// Base Input Schema
// ============================================================================

export const secretInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  note: z.string().optional(),

  valueEncryption: encryptedDataInputSchema,
  metadata: z.array(secretMetadataInputSchema),

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
