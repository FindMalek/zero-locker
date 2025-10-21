import { encryptedDataInputSchema } from "@/schemas/encryption"
import { tagInputSchema } from "@/schemas/utils/tag/input"
import { AccountStatus } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// Base Input Schema
// ============================================================================

export const credentialInputSchema = z.object({
  identifier: z.string().min(1, "Username/identifier is required"),
  description: z.string().optional(),
  status: z.nativeEnum(AccountStatus),
  platformId: z.string().min(1, "Platform is required"),
  containerId: z.string().optional(),
})

export type CredentialInput = z.infer<typeof credentialInputSchema>

// ============================================================================
// CRUD Operation Input Schemas
// ============================================================================

// Create (includes password encryption data)
export const createCredentialInputSchema = credentialInputSchema.extend({
  passwordEncryption: encryptedDataInputSchema,
  tags: z.array(tagInputSchema).optional(),
  metadata: z.any().optional(), // TODO: Placeholder for backward compatibility
})

export type CreateCredentialInput = z.infer<typeof createCredentialInputSchema>

// Get by ID
export const getCredentialInputSchema = z.object({
  id: z.string().min(1, "Credential ID is required"),
})

export type GetCredentialInput = z.infer<typeof getCredentialInputSchema>

// Update
export const updateCredentialInputSchema = credentialInputSchema
  .partial()
  .extend({
    id: z.string().min(1, "Credential ID is required"),
    tags: z.array(tagInputSchema).optional(),
    passwordEncryption: encryptedDataInputSchema.optional(),
  })

export type UpdateCredentialInput = z.infer<typeof updateCredentialInputSchema>

// Update Password
export const updateCredentialPasswordInputSchema = z.object({
  id: z.string().min(1, "Credential ID is required"),
  passwordEncryption: encryptedDataInputSchema,
})

export type UpdateCredentialPasswordInput = z.infer<
  typeof updateCredentialPasswordInputSchema
>

// Delete
export const deleteCredentialInputSchema = z.object({
  id: z.string().min(1, "Credential ID is required"),
})

export type DeleteCredentialInput = z.infer<typeof deleteCredentialInputSchema>

// Duplicate
export const duplicateCredentialInputSchema = z.object({
  id: z.string().min(1, "Credential ID is required"),
})

export type DuplicateCredentialInput = z.infer<
  typeof duplicateCredentialInputSchema
>

// ============================================================================
// List Operation Input Schema
// ============================================================================

export const listCredentialsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  containerId: z.string().optional(),
  platformId: z.string().optional(),
  status: z.nativeEnum(AccountStatus).optional(),
  filters: z.any().optional(), // Filters for advanced queries
  sort: z.any().optional(), // Sorting options
})

export type ListCredentialsInput = z.infer<typeof listCredentialsInputSchema>

// ============================================================================
// Form Input Schema (excludes password field for security)
// ============================================================================

export const credentialFormInputSchema = z.object({
  identifier: z.string().min(1, "Username/identifier is required"),
  description: z.string().optional(),
  status: z.nativeEnum(AccountStatus),
  platformId: z.string().min(1, "Platform is required"),
  containerId: z.string().optional(),

  // Security settings (metadata)
  passwordProtection: z.boolean(),
  twoFactorAuth: z.boolean(),
  accessLogging: z.boolean(),
})

export type CredentialFormInput = z.infer<typeof credentialFormInputSchema>

// ============================================================================
// Credential Action Input Schemas
// ============================================================================

// Move credential to different container
export const moveCredentialInputSchema = z.object({
  containerId: z.string().optional(),
})

export type MoveCredentialInput = z.infer<typeof moveCredentialInputSchema>

// Delete credential confirmation
export const deleteCredentialConfirmationInputSchema = z.object({
  confirmationText: z.string().min(1, "Confirmation text is required"),
})

export type DeleteCredentialConfirmationInput = z.infer<typeof deleteCredentialConfirmationInputSchema>

// ============================================================================
// Form Input Schemas (with ID for updates)
// ============================================================================

// Credential form with ID for updates
export const credentialFormWithIdInputSchema = credentialFormInputSchema.extend({
  id: z.string().min(1, "Credential ID is required"),
})

export type CredentialFormWithIdInput = z.infer<typeof credentialFormWithIdInputSchema>
