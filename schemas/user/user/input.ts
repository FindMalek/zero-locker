import { UserPlan } from "@prisma/client"
import { z } from "zod"

import { UserDto } from "@/config/schema"

// ============================================================================
// Base User Input Schema
// ============================================================================

export const inputSchema = UserDto

export type Input = z.infer<typeof inputSchema>

// ============================================================================
// CRUD Operation Input Schemas
// ============================================================================

// Create
export const createInputSchema = inputSchema

export type CreateInput = z.infer<typeof createInputSchema>

// Get by ID
export const getInputSchema = z.object({
  id: z.string().min(1, "User ID is required"),
})

export type GetInput = z.infer<typeof getInputSchema>

// Update
export const updateInputSchema = inputSchema.partial().extend({
  id: z.string().min(1, "User ID is required"),
})

export type UpdateInput = z.infer<typeof updateInputSchema>

// Delete
export const deleteInputSchema = z.object({
  id: z.string().min(1, "User ID is required"),
})

export type DeleteInput = z.infer<typeof deleteInputSchema>

// List
export const listInputSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
})

export type ListInput = z.infer<typeof listInputSchema>
