import { UserPlan } from "@prisma/client"
import { z } from "zod"

import { UserDto } from "@/config/schema"

// ============================================================================
// User Input Schemas
// ============================================================================

export const userInputSchema = UserDto

export type UserInput = z.infer<typeof userInputSchema>

// ============================================================================
// CRUD Operation Input Schemas
// ============================================================================

// Create
export const createUserInputSchema = userInputSchema

export type CreateUserInput = z.infer<typeof createUserInputSchema>

// Get by ID
export const getUserInputSchema = z.object({
  id: z.string().min(1, "User ID is required"),
})

export type GetUserInput = z.infer<typeof getUserInputSchema>

// Update
export const updateUserInputSchema = userInputSchema.partial().extend({
  id: z.string().min(1, "User ID is required"),
})

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>

// Delete
export const deleteUserInputSchema = z.object({
  id: z.string().min(1, "User ID is required"),
})

export type DeleteUserInput = z.infer<typeof deleteUserInputSchema>

// List
export const listUsersInputSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
})

export type ListUsersInput = z.infer<typeof listUsersInputSchema>
