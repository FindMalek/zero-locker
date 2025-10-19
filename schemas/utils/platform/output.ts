import { PlatformStatus } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// Simple Return Object (RO)
// ============================================================================

export const platformSimpleOutputSchema = z.object({
  id: z.string(),

  name: z.string(),

  status: z.nativeEnum(PlatformStatus),

  logo: z.string(),
  loginUrl: z.string(),

  updatedAt: z.date(),
  createdAt: z.date(),

  userId: z.string().nullable(),
})

export type PlatformSimpleOutput = z.infer<typeof platformSimpleOutputSchema>

// ============================================================================
// List Response Output Schema
// ============================================================================

export const listPlatformsOutputSchema = z.object({
  platforms: z.array(platformSimpleOutputSchema),
  total: z.number().int(),
  hasMore: z.boolean(),
  page: z.number().int(),
  limit: z.number().int(),
})

export type ListPlatformsOutput = z.infer<typeof listPlatformsOutputSchema>

// ============================================================================
// Backward Compatibility Aliases (DEPRECATED - use new names)
// ============================================================================

/** @deprecated Use platformSimpleOutputSchema instead */
export const platformSimpleRoSchema = platformSimpleOutputSchema
/** @deprecated Use PlatformSimpleOutput instead */
export type PlatformSimpleRo = PlatformSimpleOutput

/** @deprecated Use platformSimpleOutputSchema instead */
export const platformOutputSchema = platformSimpleOutputSchema
/** @deprecated Use PlatformSimpleOutput instead */
export type PlatformOutput = PlatformSimpleOutput
