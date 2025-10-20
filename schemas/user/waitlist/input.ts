import { z } from "zod"

// ============================================================================
// Waitlist Input Schemas
// ============================================================================

export const joinWaitlistInputSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export type JoinWaitlistInput = z.infer<typeof joinWaitlistInputSchema>

// ============================================================================
// Legacy aliases for backward compatibility
// ============================================================================

export const joinInputSchema = joinWaitlistInputSchema

export type JoinInput = JoinWaitlistInput
