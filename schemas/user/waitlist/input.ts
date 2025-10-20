import { z } from "zod"

// ============================================================================
// Waitlist Input Schemas
// ============================================================================

export const waitlistInputSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export type WaitlistInput = z.infer<typeof waitlistInputSchema>
