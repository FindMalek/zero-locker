import { tagSimpleRoSchema } from "@/schemas/utils/tag"
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
// Public API Exports (with entity prefix for clarity)
// ============================================================================

export const credentialSimpleOutputSchema = simpleOutputSchema
export type CredentialSimpleOutput = SimpleOutput

export const credentialSimpleRoSchema = simpleOutputSchema
export type CredentialSimpleRo = SimpleOutput

export const credentialIncludeOutputSchema = includeOutputSchema
export type CredentialIncludeOutput = IncludeOutput

export const credentialIncludeRoSchema = includeOutputSchema
export type CredentialIncludeRo = IncludeOutput

export const credentialOutputSchema = simpleOutputSchema
export type CredentialOutput = SimpleOutput

export const listCredentialsOutputSchema = listOutputSchema
export type ListCredentialsOutput = ListOutput
