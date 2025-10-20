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
