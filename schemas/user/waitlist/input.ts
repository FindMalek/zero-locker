import { z } from "zod"

// ============================================================================
// Waitlist Input Schemas
// ============================================================================

export const waitlistInputSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export type WaitlistInput = z.infer<typeof waitlistInputSchema>

// ============================================================================
// Legacy aliases for backward compatibility
// ============================================================================

export const joinWaitlistInputSchema = waitlistInputSchema
export const joinInputSchema = waitlistInputSchema

export type JoinWaitlistInput = WaitlistInput
export type JoinInput = WaitlistInput
