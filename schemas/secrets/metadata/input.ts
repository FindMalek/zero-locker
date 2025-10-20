import { SecretStatus, SecretType } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// Secret Metadata Input Schemas
// ============================================================================

export const secretMetadataDtoSchema = z.object({
  type: z.nativeEnum(SecretType),
  status: z.nativeEnum(SecretStatus),
  expiresAt: z.date().optional(),
  otherInfo: z.array(z.any()),
  secretId: z.string(),
})

export type SecretMetadataDto = z.infer<typeof secretMetadataDtoSchema>

// ============================================================================
// CRUD Operation Input Schemas
// ============================================================================

// Create
export const createInputSchema = secretMetadataDtoSchema

export type CreateInput = z.infer<typeof createInputSchema>

// Get by Secret ID
export const getInputSchema = z.object({
  secretId: z.string().min(1, "Secret ID is required"),
})

export type GetInput = z.infer<typeof getInputSchema>

// Update
export const updateInputSchema = z.object({
  id: z.string().min(1, "Metadata ID is required"),
  data: secretMetadataDtoSchema.partial(),
})

export type UpdateInput = z.infer<typeof updateInputSchema>

// Delete
export const deleteInputSchema = z.object({
  id: z.string().min(1, "Metadata ID is required"),
})

export type DeleteInput = z.infer<typeof deleteInputSchema>

// List
export const listInputSchema = z.object({
  secretId: z.string().min(1, "Secret ID is required"),
})

export type ListInput = z.infer<typeof listInputSchema>

// ============================================================================
// Base Input Schema (alias for backward compatibility)
// ============================================================================

export const inputSchema = secretMetadataDtoSchema

export type Input = z.infer<typeof inputSchema>
