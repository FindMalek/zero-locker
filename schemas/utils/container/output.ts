import { ContainerType } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// Simple Return Object (RO)
// ============================================================================

export const simpleOutputSchema = z.object({
  id: z.string(),

  name: z.string(),
  icon: z.string(),
  isDefault: z.boolean(),

  description: z.string().nullable(),
  type: z.nativeEnum(ContainerType),

  updatedAt: z.date(),
  createdAt: z.date(),

  userId: z.string(),
})

export type SimpleOutput = z.infer<typeof simpleOutputSchema>

// ============================================================================
// List Response Output Schema
// ============================================================================

export const listOutputSchema = z.object({
  containers: z.array(simpleOutputSchema),
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
export const containerSimpleOutputSchema = simpleOutputSchema
/** @deprecated Use SimpleOutput instead */
export type ContainerSimpleOutput = SimpleOutput

/** @deprecated Use simpleOutputSchema instead */
export const containerSimpleRoSchema = simpleOutputSchema
/** @deprecated Use SimpleOutput instead */
export type ContainerSimpleRo = SimpleOutput

/** @deprecated Use simpleOutputSchema instead */
export const containerOutputSchema = simpleOutputSchema
/** @deprecated Use SimpleOutput instead */
export type ContainerOutput = SimpleOutput

/** @deprecated Use listOutputSchema instead */
export const listContainersOutputSchema = listOutputSchema
/** @deprecated Use ListOutput instead */
export type ListContainersOutput = ListOutput
