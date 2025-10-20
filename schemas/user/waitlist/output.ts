import { z } from "zod"

// ============================================================================
// Waitlist Output Schemas
// ============================================================================

export const joinWaitlistOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  position: z.number().int().min(1).optional(),
})

export type JoinWaitlistOutput = z.infer<typeof joinWaitlistOutputSchema>

export const getWaitlistCountOutputSchema = z.object({
  total: z.number().int().min(0),
})

export type GetWaitlistCountOutput = z.infer<
  typeof getWaitlistCountOutputSchema
>

// ============================================================================
// Legacy aliases for backward compatibility
// ============================================================================

export const joinOutputSchema = joinWaitlistOutputSchema
export const countOutputSchema = getWaitlistCountOutputSchema

export type JoinOutput = JoinWaitlistOutput
export type CountOutput = GetWaitlistCountOutput
