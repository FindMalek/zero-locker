import { z } from "zod"

// ============================================================================
// Simple Return Object (RO)
// ============================================================================

export const simpleOutputSchema = z.object({
  id: z.string(),
  name: z.string(),

  color: z.string(),

  userId: z.string().nullable(),
  containerId: z.string().nullable(),
})

export type SimpleOutput = z.infer<typeof simpleOutputSchema>

// ============================================================================
// List Response Output Schema
// ============================================================================

export const listOutputSchema = z.object({
  tags: z.array(simpleOutputSchema),
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
export const tagSimpleOutputSchema = simpleOutputSchema
/** @deprecated Use SimpleOutput instead */
export type TagSimpleOutput = SimpleOutput

/** @deprecated Use simpleOutputSchema instead */
export const tagSimpleRoSchema = simpleOutputSchema
/** @deprecated Use SimpleOutput instead */
export type TagSimpleRo = SimpleOutput

/** @deprecated Use simpleOutputSchema instead */
export const tagOutputSchema = simpleOutputSchema
/** @deprecated Use SimpleOutput instead */
export type TagOutput = SimpleOutput

/** @deprecated Use listOutputSchema instead */
export const listTagsOutputSchema = listOutputSchema
/** @deprecated Use ListOutput instead */
export type ListTagsOutput = ListOutput
