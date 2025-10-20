import { tagSimpleOutputSchema } from "@/schemas/utils"
import { AccountStatus } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// Simple Return Object (RO)
// ============================================================================

export const credentialSimpleOutputSchema = z.object({
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

export type CredentialSimpleOutput = z.infer<
  typeof credentialSimpleOutputSchema
>

// ============================================================================
// Include Return Object (with relations)
// ============================================================================

export const credentialIncludeOutputSchema =
  credentialSimpleOutputSchema.extend({
    tags: z.array(tagSimpleOutputSchema),
  })

export type CredentialIncludeOutput = z.infer<
  typeof credentialIncludeOutputSchema
>

// ============================================================================
// List Response Output Schema
// ============================================================================

export const listCredentialsOutputSchema = z.object({
  credentials: z.array(credentialIncludeOutputSchema),
  total: z.number().int(),
  hasMore: z.boolean(),
  page: z.number().int(),
  limit: z.number().int(),
})

export type ListCredentialsOutput = z.infer<typeof listCredentialsOutputSchema>

// Alias for backward compatibility
export const credentialOutputSchema = credentialSimpleOutputSchema
export type CredentialOutput = CredentialSimpleOutput
