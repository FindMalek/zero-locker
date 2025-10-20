import { ContainerType } from "@prisma/client"
import { z } from "zod"

import { tagInputSchema } from "../tag"

// ============================================================================
// Base Input Schema
// ============================================================================

export const containerInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),

  description: z.string().optional(),

  type: z.nativeEnum(ContainerType),
  tags: z.array(tagInputSchema),
})

export type ContainerInput = z.infer<typeof containerInputSchema>

// ============================================================================
// CRUD Operation Input Schemas
// ============================================================================

// Create
export const createContainerInputSchema = containerInputSchema

export type CreateContainerInput = z.infer<typeof createContainerInputSchema>

// Get by ID
export const getContainerInputSchema = z.object({
  id: z.string().min(1, "Container ID is required"),
})

export type GetContainerInput = z.infer<typeof getContainerInputSchema>

// Update
export const updateContainerInputSchema = containerInputSchema
  .partial()
  .extend({
    id: z.string().min(1, "Container ID is required"),
  })

export type UpdateContainerInput = z.infer<typeof updateContainerInputSchema>

// Delete
export const deleteContainerInputSchema = z.object({
  id: z.string().min(1, "Container ID is required"),
})

export type DeleteContainerInput = z.infer<typeof deleteContainerInputSchema>

// ============================================================================
// List Operation Input Schema
// ============================================================================

export const listContainersInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
})

export type ListContainersInput = z.infer<typeof listContainersInputSchema>
