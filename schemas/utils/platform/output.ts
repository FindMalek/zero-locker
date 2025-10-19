import { PlatformStatus } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// Simple Return Object (RO)
// ============================================================================

export const simpleOutputSchema = z.object({
  id: z.string(),

  name: z.string(),

  status: z.nativeEnum(PlatformStatus),

  logo: z.string(),
  loginUrl: z.string(),

  updatedAt: z.date(),
  createdAt: z.date(),

  userId: z.string().nullable(),
})

export type SimpleOutput = z.infer<typeof simpleOutputSchema>

// ============================================================================
// List Response Output Schema
// ============================================================================

export const listOutputSchema = z.object({
  platforms: z.array(simpleOutputSchema),
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
export const platformSimpleOutputSchema = simpleOutputSchema
/** @deprecated Use SimpleOutput instead */
export type PlatformSimpleOutput = SimpleOutput

/** @deprecated Use simpleOutputSchema instead */
export const platformSimpleRoSchema = simpleOutputSchema
/** @deprecated Use SimpleOutput instead */
export type PlatformSimpleRo = SimpleOutput

/** @deprecated Use simpleOutputSchema instead */
export const platformOutputSchema = simpleOutputSchema
/** @deprecated Use SimpleOutput instead */
export type PlatformOutput = SimpleOutput

/** @deprecated Use listOutputSchema instead */
export const listPlatformsOutputSchema = listOutputSchema
/** @deprecated Use ListOutput instead */
export type ListPlatformsOutput = ListOutput
