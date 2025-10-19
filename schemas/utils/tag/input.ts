import { z } from "zod"

// ============================================================================
// Base Input Schema
// ============================================================================

export const tagInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().optional(),
  containerId: z.string().optional(),
})

export type TagInput = z.infer<typeof tagInputSchema>

// ============================================================================
// CRUD Operation Input Schemas
// ============================================================================

// Create
export const createTagInputSchema = tagInputSchema

export type CreateTagInput = z.infer<typeof createTagInputSchema>

// Get by ID
export const getTagInputSchema = z.object({
  id: z.string().min(1, "Tag ID is required"),
})

export type GetTagInput = z.infer<typeof getTagInputSchema>

// Update
export const updateTagInputSchema = tagInputSchema.partial().extend({
  id: z.string().min(1, "Tag ID is required"),
})

export type UpdateTagInput = z.infer<typeof updateTagInputSchema>

// Delete
export const deleteTagInputSchema = z.object({
  id: z.string().min(1, "Tag ID is required"),
})

export type DeleteTagInput = z.infer<typeof deleteTagInputSchema>

// ============================================================================
// List Operation Input Schema
// ============================================================================

export const listTagsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  containerId: z.string().optional(),
})

export type ListTagsInput = z.infer<typeof listTagsInputSchema>

// ============================================================================
// Backward Compatibility Aliases (DEPRECATED - use new names)
// ============================================================================

/** @deprecated Use tagInputSchema instead */
export const tagDtoSchema = tagInputSchema
/** @deprecated Use TagInput instead */
export type TagDto = TagInput

/** @deprecated Use getTagInputSchema instead */
export const getTagByIdDtoSchema = getTagInputSchema
/** @deprecated Use GetTagInput instead */
export type GetTagByIdDto = GetTagInput

/** @deprecated Use updateTagInputSchema instead */
export const updateTagDtoSchema = updateTagInputSchema
/** @deprecated Use UpdateTagInput instead */
export type UpdateTagDto = UpdateTagInput

/** @deprecated Use deleteTagInputSchema instead */
export const deleteTagDtoSchema = deleteTagInputSchema
/** @deprecated Use DeleteTagInput instead */
export type DeleteTagDto = DeleteTagInput
