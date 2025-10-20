import { UserPlan } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// User Output Schemas
// ============================================================================

export const currentUserDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  plan: z.nativeEnum(UserPlan),
  image: z.string().nullable(),
  createdAt: z.union([z.date(), z.string().datetime()]),
})

export type CurrentUserDto = z.infer<typeof currentUserDtoSchema>

// ============================================================================
// Legacy aliases for backward compatibility
// ============================================================================

export const simpleOutputSchema = currentUserDtoSchema
export const outputSchema = currentUserDtoSchema

export type SimpleOutput = CurrentUserDto
export type Output = CurrentUserDto
