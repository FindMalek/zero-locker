import { encryptedDataDtoSchema } from "@/schemas/encryption/encryption"
import { tagDtoSchema } from "@/schemas/utils/tag"
import { AccountStatus } from "@prisma/client"
import { z } from "zod"

import { metadataInputSchema } from "./metadata"

// ============================================================================
// Base Input Schema
// ============================================================================

export const inputSchema = z.object({
  identifier: z.string().min(1, "Username/identifier is required"),
  passwordEncryption: encryptedDataDtoSchema,

  status: z.nativeEnum(AccountStatus),
  description: z.string().optional(),

  tags: z.array(tagDtoSchema),
  metadata: z.array(metadataInputSchema),

  platformId: z.string().min(1, "Platform is required"),
  containerId: z.string().optional(),
})

export type Input = z.infer<typeof inputSchema>

// ============================================================================
// CRUD Operation Input Schemas
// ============================================================================

// Create
export const createInputSchema = inputSchema

export type CreateInput = z.infer<typeof createInputSchema>

// Get by ID
export const getInputSchema = z.object({
  id: z.string().min(1, "Credential ID is required"),
})

export type GetInput = z.infer<typeof getInputSchema>

// Update
export const updateInputSchema = inputSchema.partial().extend({
  id: z.string().min(1, "Credential ID is required"),
})

export type UpdateInput = z.infer<typeof updateInputSchema>

// Update Password with History
export const updatePasswordInputSchema = z.object({
  id: z.string().min(1, "Credential ID is required"),
  passwordEncryption: z.object({
    encryptedValue: z.string().min(1, "Encrypted value is required"),
    iv: z.string().min(1, "IV is required"),
    encryptionKey: z.string().min(1, "Encryption key is required"),
  }),
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
  // Filters
  filters: z
    .object({
      statuses: z.array(z.nativeEnum(AccountStatus)).optional(),
      platformIds: z.array(z.string()).optional(),
      showArchived: z.boolean().optional(),
    })
    .optional(),
  // Sorting
  sort: z
    .object({
      field: z
        .enum(["identifier", "status", "lastViewed", "createdAt"])
        .optional(),
      direction: z.enum(["asc", "desc"]).optional(),
    })
    .optional(),
})

export type ListInput = z.infer<typeof listInputSchema>

// ============================================================================
// Form-Specific Input Schema
// ============================================================================

// Form schema for credential editing (excluding encryption details)
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
// Backward Compatibility Aliases (DEPRECATED - use new names)
// ============================================================================

/** @deprecated Use inputSchema instead */
export const credentialInputSchema = inputSchema
/** @deprecated Use Input instead */
export type CredentialInput = Input

/** @deprecated Use inputSchema instead */
export const credentialDtoSchema = inputSchema
/** @deprecated Use Input instead */
export type CredentialDto = Input

/** @deprecated Use createInputSchema instead */
export const createCredentialInputSchema = createInputSchema
/** @deprecated Use CreateInput instead */
export type CreateCredentialInput = CreateInput

/** @deprecated Use getInputSchema instead */
export const getCredentialInputSchema = getInputSchema
/** @deprecated Use GetInput instead */
export type GetCredentialInput = GetInput

/** @deprecated Use getInputSchema instead */
export const getCredentialByIdDtoSchema = getInputSchema
/** @deprecated Use GetInput instead */
export type GetCredentialByIdDto = GetInput

/** @deprecated Use updateInputSchema instead */
export const updateCredentialInputSchema = updateInputSchema
/** @deprecated Use UpdateInput instead */
export type UpdateCredentialInput = UpdateInput

/** @deprecated Use updateInputSchema instead */
export const updateCredentialDtoSchema = updateInputSchema
/** @deprecated Use UpdateInput instead */
export type UpdateCredentialDto = UpdateInput

/** @deprecated Use updatePasswordInputSchema instead */
export const updateCredentialPasswordInputSchema = updatePasswordInputSchema
/** @deprecated Use UpdatePasswordInput instead */
export type UpdateCredentialPasswordInput = UpdatePasswordInput

/** @deprecated Use deleteInputSchema instead */
export const deleteCredentialInputSchema = deleteInputSchema
/** @deprecated Use DeleteInput instead */
export type DeleteCredentialInput = DeleteInput

/** @deprecated Use deleteInputSchema instead */
export const deleteCredentialDtoSchema = deleteInputSchema
/** @deprecated Use DeleteInput instead */
export type DeleteCredentialDto = DeleteInput

/** @deprecated Use duplicateInputSchema instead */
export const duplicateCredentialInputSchema = duplicateInputSchema
/** @deprecated Use DuplicateInput instead */
export type DuplicateCredentialInput = DuplicateInput

/** @deprecated Use listInputSchema instead */
export const listCredentialsInputSchema = listInputSchema
/** @deprecated Use ListInput instead */
export type ListCredentialsInput = ListInput

/** @deprecated Use formInputSchema instead */
export const credentialFormInputSchema = formInputSchema
/** @deprecated Use FormInput instead */
export type CredentialFormInput = FormInput

/** @deprecated Use formInputSchema instead */
export const credentialFormDtoSchema = formInputSchema
/** @deprecated Use FormInput instead */
export type CredentialFormDto = FormInput
