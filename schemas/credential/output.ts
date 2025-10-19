import { tagSimpleRoSchema } from "@/schemas/utils/tag/output"
import { AccountStatus } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// Simple Return Object (RO)
// ============================================================================

export const simpleOutputSchema = z.object({
  id: z.string(),

  identifier: z.string(),
  description: z.string().nullable(),
  status: z.nativeEnum(AccountStatus),

  lastViewed: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),

  platformId: z.string(),
  userId: z.string(),
  containerId: z.string().nullable(),
  passwordEncryptionId: z.string(),
})

export type SimpleOutput = z.infer<typeof simpleOutputSchema>

// ============================================================================
// Include Return Object (with relations)
// ============================================================================

export const includeOutputSchema = simpleOutputSchema.extend({
  tags: z.array(tagSimpleRoSchema),
})

export type IncludeOutput = z.infer<typeof includeOutputSchema>

// ============================================================================
// List Response Output Schema
// ============================================================================

export const listOutputSchema = z.object({
  credentials: z.array(includeOutputSchema),
  total: z.number().int(),
  hasMore: z.boolean(),
  page: z.number().int(),
  limit: z.number().int(),
})

export type ListOutput = z.infer<typeof listOutputSchema>

// ============================================================================
// Backward Compatibility Aliases (DEPRECATED - use new names)
// ============================================================================

/** @deprecated Use simpleOutputSchema instead */
export const credentialSimpleOutputSchema = simpleOutputSchema
/** @deprecated Use SimpleOutput instead */
export type CredentialSimpleOutput = SimpleOutput

/** @deprecated Use simpleOutputSchema instead */
export const credentialSimpleRoSchema = simpleOutputSchema
/** @deprecated Use SimpleOutput instead */
export type CredentialSimpleRo = SimpleOutput

/** @deprecated Use includeOutputSchema instead */
export const credentialIncludeOutputSchema = includeOutputSchema
/** @deprecated Use IncludeOutput instead */
export type CredentialIncludeOutput = IncludeOutput

/** @deprecated Use includeOutputSchema instead */
export const credentialIncludeRoSchema = includeOutputSchema
/** @deprecated Use IncludeOutput instead */
export type CredentialIncludeRo = IncludeOutput

/** @deprecated Use simpleOutputSchema instead */
export const credentialOutputSchema = simpleOutputSchema
/** @deprecated Use SimpleOutput instead */
export type CredentialOutput = SimpleOutput

/** @deprecated Use listOutputSchema instead */
export const listCredentialsOutputSchema = listOutputSchema
/** @deprecated Use ListOutput instead */
export type ListCredentialsOutput = ListOutput

