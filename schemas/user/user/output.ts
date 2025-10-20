import { UserPlan } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// User Output Schemas
// ============================================================================

export const userSimpleOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  plan: z.nativeEnum(UserPlan),
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
// Legacy aliases for backward compatibility
// ============================================================================

export const currentUserDtoSchema = userSimpleOutputSchema
export const simpleOutputSchema = userSimpleOutputSchema
export const outputSchema = userSimpleOutputSchema

export type CurrentUserDto = UserSimpleOutput
export type SimpleOutput = UserSimpleOutput
export type Output = UserSimpleOutput
