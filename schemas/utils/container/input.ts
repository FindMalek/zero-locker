import { ContainerType } from "@prisma/client"
import { z } from "zod"

import { tagDtoSchema } from "../tag"

// ============================================================================
// Base Input Schema
// ============================================================================

export const inputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),

  description: z.string().optional(),

  type: z.nativeEnum(ContainerType),
  tags: z.array(tagDtoSchema),
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
  id: z.string().min(1, "Container ID is required"),
})

export type GetInput = z.infer<typeof getInputSchema>

// Update
export const updateInputSchema = inputSchema.partial().extend({
  id: z.string().min(1, "Container ID is required"),
})

export type UpdateInput = z.infer<typeof updateInputSchema>

// Delete
export const deleteInputSchema = z.object({
  id: z.string().min(1, "Container ID is required"),
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
export const containerInputSchema = inputSchema
/** @deprecated Use Input instead */
export type ContainerInput = Input

/** @deprecated Use inputSchema instead */
export const containerDtoSchema = inputSchema
/** @deprecated Use Input instead */
export type ContainerDto = Input

/** @deprecated Use createInputSchema instead */
export const createContainerInputSchema = createInputSchema
/** @deprecated Use CreateInput instead */
export type CreateContainerInput = CreateInput

/** @deprecated Use getInputSchema instead */
export const getContainerInputSchema = getInputSchema
/** @deprecated Use GetInput instead */
export type GetContainerInput = GetInput

/** @deprecated Use getInputSchema instead */
export const getContainerByIdDtoSchema = getInputSchema
/** @deprecated Use GetInput instead */
export type GetContainerByIdDto = GetInput

/** @deprecated Use updateInputSchema instead */
export const updateContainerInputSchema = updateInputSchema
/** @deprecated Use UpdateInput instead */
export type UpdateContainerInput = UpdateInput

/** @deprecated Use updateInputSchema instead */
export const updateContainerDtoSchema = updateInputSchema
/** @deprecated Use UpdateInput instead */
export type UpdateContainerDto = UpdateInput

/** @deprecated Use deleteInputSchema instead */
export const deleteContainerInputSchema = deleteInputSchema
/** @deprecated Use DeleteInput instead */
export type DeleteContainerInput = DeleteInput

/** @deprecated Use deleteInputSchema instead */
export const deleteContainerDtoSchema = deleteInputSchema
/** @deprecated Use DeleteInput instead */
export type DeleteContainerDto = DeleteInput

/** @deprecated Use listInputSchema instead */
export const listContainersInputSchema = listInputSchema
/** @deprecated Use ListInput instead */
export type ListContainersInput = ListInput
