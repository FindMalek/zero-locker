import { encryptedDataDtoSchema } from "@/schemas/encryption"
import { tagDtoSchema } from "@/schemas/utils"
import { AccountStatus } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// Base Input Schema
// ============================================================================

export const inputSchema = z.object({
  identifier: z.string().min(1, "Username/identifier is required"),
  description: z.string().optional(),
  status: z.nativeEnum(AccountStatus),
  platformId: z.string().min(1, "Platform is required"),
  containerId: z.string().optional(),
})

export type Input = z.infer<typeof inputSchema>

// ============================================================================
// CRUD Operation Input Schemas
// ============================================================================

// Create (includes password encryption data)
export const createInputSchema = inputSchema.extend({
  passwordEncryption: encryptedDataDtoSchema,
  tags: z.array(tagDtoSchema).optional(),
  metadata: z.any().optional(), // Placeholder for backward compatibility
})

export type CreateInput = z.infer<typeof createInputSchema>

// Get by ID
export const getInputSchema = z.object({
  id: z.string().min(1, "Credential ID is required"),
})

export type GetInput = z.infer<typeof getInputSchema>

// Update
export const updateInputSchema = inputSchema.partial().extend({
  id: z.string().min(1, "Credential ID is required"),
  tags: z.array(tagDtoSchema).optional(),
  passwordEncryption: encryptedDataDtoSchema.optional(),
})

export type UpdateInput = z.infer<typeof updateInputSchema>

// Update Password
export const updatePasswordInputSchema = z.object({
  id: z.string().min(1, "Credential ID is required"),
  passwordEncryption: encryptedDataDtoSchema,
})

export type UpdatePasswordInput = z.infer<typeof updatePasswordInputSchema>

// Delete
export const deleteInputSchema = z.object({
  id: z.string().min(1, "Credential ID is required"),
})

export type DeleteInput = z.infer<typeof deleteInputSchema>

// Duplicate
export const duplicateInputSchema = z.object({
  id: z.string().min(1, "Credential ID is required"),
})

export type DuplicateInput = z.infer<typeof duplicateInputSchema>

// ============================================================================
// List Operation Input Schema
// ============================================================================

export const listInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  containerId: z.string().optional(),
  platformId: z.string().optional(),
  status: z.nativeEnum(AccountStatus).optional(),
  filters: z.any().optional(), // Filters for advanced queries
  sort: z.any().optional(), // Sorting options
})

export type ListInput = z.infer<typeof listInputSchema>

// ============================================================================
// Form Input Schema (excludes password field for security)
// ============================================================================

export const formInputSchema = z.object({
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

export type FormInput = z.infer<typeof formInputSchema>

// ============================================================================
// Public API Exports (with entity prefix for clarity)
// ============================================================================

export const credentialInputSchema = inputSchema
export type CredentialInput = Input

export const credentialDtoSchema = inputSchema
export type CredentialDto = Input

export const createCredentialInputSchema = createInputSchema
export type CreateCredentialInput = CreateInput

export const getCredentialInputSchema = getInputSchema
export type GetCredentialInput = GetInput

export const getCredentialByIdDtoSchema = getInputSchema
export type GetCredentialByIdDto = GetInput

export const updateCredentialInputSchema = updateInputSchema
export type UpdateCredentialInput = UpdateInput

export const updateCredentialDtoSchema = updateInputSchema
export type UpdateCredentialDto = UpdateInput

export const updateCredentialPasswordInputSchema = updatePasswordInputSchema
export type UpdateCredentialPasswordInput = UpdatePasswordInput

export const deleteCredentialInputSchema = deleteInputSchema
export type DeleteCredentialInput = DeleteInput

export const deleteCredentialDtoSchema = deleteInputSchema
export type DeleteCredentialDto = DeleteInput

export const duplicateCredentialInputSchema = duplicateInputSchema
export type DuplicateCredentialInput = DuplicateInput

export const listCredentialsInputSchema = listInputSchema
export type ListCredentialsInput = ListInput

export const credentialFormInputSchema = formInputSchema
export type CredentialFormInput = FormInput

export const credentialFormDtoSchema = formInputSchema
export type CredentialFormDto = FormInput
