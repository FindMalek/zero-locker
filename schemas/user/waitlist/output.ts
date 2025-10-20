import { z } from "zod"

// ============================================================================
// Waitlist Output Schemas
// ============================================================================

export const waitlistJoinOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
  position: z.number().int().min(1).optional(),
})

export type WaitlistJoinOutput = z.infer<typeof waitlistJoinOutputSchema>

export const waitlistCountOutputSchema = z.object({
  total: z.number().int().min(0),
})

export type WaitlistCountOutput = z.infer<typeof waitlistCountOutputSchema>

// ============================================================================
// Legacy aliases for backward compatibility
// ============================================================================

export const joinWaitlistOutputSchema = waitlistJoinOutputSchema
export const getWaitlistCountOutputSchema = waitlistCountOutputSchema
export const joinOutputSchema = waitlistJoinOutputSchema
export const countOutputSchema = waitlistCountOutputSchema

export type JoinWaitlistOutput = WaitlistJoinOutput
export type GetWaitlistCountOutput = WaitlistCountOutput
export type JoinOutput = WaitlistJoinOutput
export type CountOutput = WaitlistCountOutput
