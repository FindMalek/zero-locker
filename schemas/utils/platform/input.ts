import { PlatformStatus } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// Base Input Schema
// ============================================================================

export const platformInputSchema = z.object({
  name: z.string().min(1, "Name is required"),

  logo: z.string().optional(),
  loginUrl: z.string().optional(),

  status: z
    .nativeEnum(PlatformStatus)
    .optional()
    .default(PlatformStatus.PENDING),
})

export type PlatformInput = z.infer<typeof platformInputSchema>

// ============================================================================
// CRUD Operation Input Schemas
// ============================================================================

// Create
export const createPlatformInputSchema = platformInputSchema

export type CreatePlatformInput = z.infer<typeof createPlatformInputSchema>

// Get by ID
export const getPlatformInputSchema = z.object({
  id: z.string().min(1, "Platform ID is required"),
})

export type GetPlatformInput = z.infer<typeof getPlatformInputSchema>

// Update
export const updatePlatformInputSchema = platformInputSchema.partial().extend({
  id: z.string().min(1, "Platform ID is required"),
})

export type UpdatePlatformInput = z.infer<typeof updatePlatformInputSchema>

// Delete
export const deletePlatformInputSchema = z.object({
  id: z.string().min(1, "Platform ID is required"),
})

export type DeletePlatformInput = z.infer<typeof deletePlatformInputSchema>

// ============================================================================
// List Operation Input Schema
// ============================================================================

export const listPlatformsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
})

export type ListPlatformsInput = z.infer<typeof listPlatformsInputSchema>
