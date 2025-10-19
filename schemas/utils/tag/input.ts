import { z } from "zod"

// ============================================================================
// Base Input Schema
// ============================================================================

export const inputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().optional(),
  containerId: z.string().optional(),
})

export type Input = z.infer<typeof inputSchema>

// ============================================================================
// CRUD Operation Input Schemas
// ============================================================================

// Create
export const createInputSchema = inputSchema

export type CreateInput = z.infer<typeof createInputSchema>

// Get by ID
export const getInputSchema = z.object({
  id: z.string().min(1, "Tag ID is required"),
})

export type GetInput = z.infer<typeof getInputSchema>

// Update
export const updateInputSchema = inputSchema.partial().extend({
  id: z.string().min(1, "Tag ID is required"),
})

export type UpdateInput = z.infer<typeof updateInputSchema>

// Delete
export const deleteInputSchema = z.object({
  id: z.string().min(1, "Tag ID is required"),
})

export type DeleteInput = z.infer<typeof deleteInputSchema>

// ============================================================================
// List Operation Input Schema
// ============================================================================

export const listInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  containerId: z.string().optional(),
})

export type ListInput = z.infer<typeof listInputSchema>

// ============================================================================
// Backward Compatibility Aliases (DEPRECATED - use new names)
// ============================================================================

/** @deprecated Use inputSchema instead */
export const tagInputSchema = inputSchema
/** @deprecated Use Input instead */
export type TagInput = Input

/** @deprecated Use inputSchema instead */
export const tagDtoSchema = inputSchema
/** @deprecated Use Input instead */
export type TagDto = Input

/** @deprecated Use createInputSchema instead */
export const createTagInputSchema = createInputSchema
/** @deprecated Use CreateInput instead */
export type CreateTagInput = CreateInput

/** @deprecated Use getInputSchema instead */
export const getTagInputSchema = getInputSchema
/** @deprecated Use GetInput instead */
export type GetTagInput = GetInput

/** @deprecated Use getInputSchema instead */
export const getTagByIdDtoSchema = getInputSchema
/** @deprecated Use GetInput instead */
export type GetTagByIdDto = GetInput

/** @deprecated Use updateInputSchema instead */
export const updateTagInputSchema = updateInputSchema
/** @deprecated Use UpdateInput instead */
export type UpdateTagInput = UpdateInput

/** @deprecated Use updateInputSchema instead */
export const updateTagDtoSchema = updateInputSchema
/** @deprecated Use UpdateInput instead */
export type UpdateTagDto = UpdateInput

/** @deprecated Use deleteInputSchema instead */
export const deleteTagInputSchema = deleteInputSchema
/** @deprecated Use DeleteInput instead */
export type DeleteTagInput = DeleteInput

/** @deprecated Use deleteInputSchema instead */
export const deleteTagDtoSchema = deleteInputSchema
/** @deprecated Use DeleteInput instead */
export type DeleteTagDto = DeleteInput

/** @deprecated Use listInputSchema instead */
export const listTagsInputSchema = listInputSchema
/** @deprecated Use ListInput instead */
export type ListTagsInput = ListInput
