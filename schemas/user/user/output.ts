import { z } from "zod"

import { userPlanSchema } from "./enums"

// ============================================================================
// User Output Schemas
// ============================================================================

export const userSimpleOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  plan: userPlanSchema,
  image: z.string().nullable(),
  createdAt: z.union([z.date(), z.string().datetime()]),
})

export type UserSimpleOutput = z.infer<typeof userSimpleOutputSchema>

// ============================================================================
// Extended Output Schemas
// ============================================================================

export const userOutputSchema = userSimpleOutputSchema

export type UserOutput = UserSimpleOutput

// ============================================================================
// Password Change Output Schema
// ============================================================================

export const changePasswordOutputSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
})

export type ChangePasswordOutput = z.infer<typeof changePasswordOutputSchema>
