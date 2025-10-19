import { ContainerType } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// Simple Return Object (RO)
// ============================================================================

export const containerSimpleOutputSchema = z.object({
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

export type ContainerSimpleOutput = z.infer<typeof containerSimpleOutputSchema>

// ============================================================================
// List Response Output Schema
// ============================================================================

export const listContainersOutputSchema = z.object({
  containers: z.array(containerSimpleOutputSchema),
  total: z.number().int(),
  hasMore: z.boolean(),
  page: z.number().int(),
  limit: z.number().int(),
})

export type ListContainersOutput = z.infer<typeof listContainersOutputSchema>

// ============================================================================
// Backward Compatibility Aliases (DEPRECATED - use new names)
// ============================================================================

/** @deprecated Use containerSimpleOutputSchema instead */
export const containerSimpleRoSchema = containerSimpleOutputSchema
/** @deprecated Use ContainerSimpleOutput instead */
export type ContainerSimpleRo = ContainerSimpleOutput

/** @deprecated Use containerSimpleOutputSchema instead */
export const containerOutputSchema = containerSimpleOutputSchema
/** @deprecated Use ContainerSimpleOutput instead */
export type ContainerOutput = ContainerSimpleOutput

