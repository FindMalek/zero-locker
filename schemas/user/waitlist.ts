import { z } from "zod"

// Waitlist operations
export const joinWaitlistInputSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export const joinWaitlistOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
})

export const getWaitlistCountOutputSchema = z.object({
  total: z.number().int().min(0),
})

// Types
export type JoinWaitlistInput = z.infer<typeof joinWaitlistInputSchema>
export type JoinWaitlistOutput = z.infer<typeof joinWaitlistOutputSchema>
export type GetWaitlistCountOutput = z.infer<
  typeof getWaitlistCountOutputSchema
>
