import { PlatformStatus } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// Base Input Schema
// ============================================================================

export const inputSchema = z.object({
  name: z.string().min(1, "Name is required"),

  logo: z.string().optional(),
  loginUrl: z.string().optional(),

  status: z
    .nativeEnum(PlatformStatus)
    .optional()
    .default(PlatformStatus.PENDING),
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
  id: z.string().min(1, "Platform ID is required"),
})

export type GetInput = z.infer<typeof getInputSchema>

// Update
export const updateInputSchema = inputSchema.partial().extend({
  id: z.string().min(1, "Platform ID is required"),
})

export type UpdateInput = z.infer<typeof updateInputSchema>

// Delete
export const deleteInputSchema = z.object({
  id: z.string().min(1, "Platform ID is required"),
})

export type DeleteInput = z.infer<typeof deleteInputSchema>

// ============================================================================
// List Operation Input Schema
// ============================================================================

export const listInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
})

export type ListInput = z.infer<typeof listInputSchema>

// ============================================================================
// Backward Compatibility Aliases (DEPRECATED - use new names)
// ============================================================================

/** @deprecated Use inputSchema instead */
export const platformInputSchema = inputSchema
/** @deprecated Use Input instead */
export type PlatformInput = Input

/** @deprecated Use inputSchema instead */
export const platformDtoSchema = inputSchema
/** @deprecated Use Input instead */
export type PlatformDto = Input

/** @deprecated Use createInputSchema instead */
export const createPlatformInputSchema = createInputSchema
/** @deprecated Use CreateInput instead */
export type CreatePlatformInput = CreateInput

/** @deprecated Use getInputSchema instead */
export const getPlatformInputSchema = getInputSchema
/** @deprecated Use GetInput instead */
export type GetPlatformInput = GetInput

/** @deprecated Use getInputSchema instead */
export const getPlatformByIdDtoSchema = getInputSchema
/** @deprecated Use GetInput instead */
export type GetPlatformByIdDto = GetInput

/** @deprecated Use updateInputSchema instead */
export const updatePlatformInputSchema = updateInputSchema
/** @deprecated Use UpdateInput instead */
export type UpdatePlatformInput = UpdateInput

/** @deprecated Use updateInputSchema instead */
export const updatePlatformDtoSchema = updateInputSchema
/** @deprecated Use UpdateInput instead */
export type UpdatePlatformDto = UpdateInput

/** @deprecated Use deleteInputSchema instead */
export const deletePlatformInputSchema = deleteInputSchema
/** @deprecated Use DeleteInput instead */
export type DeletePlatformInput = DeleteInput

/** @deprecated Use deleteInputSchema instead */
export const deletePlatformDtoSchema = deleteInputSchema
/** @deprecated Use DeleteInput instead */
export type DeletePlatformDto = DeleteInput

/** @deprecated Use listInputSchema instead */
export const listPlatformsInputSchema = listInputSchema
/** @deprecated Use ListInput instead */
export type ListPlatformsInput = ListInput
