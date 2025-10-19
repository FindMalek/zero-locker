import { z } from "zod"

// ============================================================================
// Simple Return Object (RO)
// ============================================================================

export const tagSimpleOutputSchema = z.object({
  id: z.string(),
  name: z.string(),

  color: z.string(),

  userId: z.string().nullable(),
  containerId: z.string().nullable(),
})

export type TagSimpleOutput = z.infer<typeof tagSimpleOutputSchema>

// ============================================================================
// List Response Output Schema
// ============================================================================

export const listTagsOutputSchema = z.object({
  tags: z.array(tagSimpleOutputSchema),
  total: z.number().int(),
  hasMore: z.boolean(),
  page: z.number().int(),
  limit: z.number().int(),
})

export type ListTagsOutput = z.infer<typeof listTagsOutputSchema>

// ============================================================================
// Backward Compatibility Aliases (DEPRECATED - use new names)
// ============================================================================

/** @deprecated Use tagSimpleOutputSchema instead */
export const tagSimpleRoSchema = tagSimpleOutputSchema
/** @deprecated Use TagSimpleOutput instead */
export type TagSimpleRo = TagSimpleOutput

/** @deprecated Use tagSimpleOutputSchema instead */
export const tagOutputSchema = tagSimpleOutputSchema
/** @deprecated Use TagSimpleOutput instead */
export type TagOutput = TagSimpleOutput

