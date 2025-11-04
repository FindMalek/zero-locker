import { UserPlan } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// User Input Schemas
// ============================================================================

export const userInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  emailVerified: z.boolean().default(false),
  image: z.string().url().optional(),
})

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

// ============================================================================
// Authentication Form Schemas
// ============================================================================

export const loginInputSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean(),
})

export type LoginInput = z.infer<typeof loginInputSchema>

export const signUpInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  image: z.string().url("Please enter a valid image URL").optional(),
})

export type SignUpInput = z.infer<typeof signUpInputSchema>

// Account Update Schemas
export const updateProfileInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
})

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>

export const updateEmailInputSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export type UpdateEmailInput = z.infer<typeof updateEmailInputSchema>

export const updatePasswordInputSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type UpdatePasswordInput = z.infer<typeof updatePasswordInputSchema>
