import { z } from "zod"

// Input schema for subscribing to roadmap updates
export const subscribeToRoadmapInputSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
})

export type SubscribeToRoadmapInput = z.infer<
  typeof subscribeToRoadmapInputSchema
>

// Output schema for roadmap subscription
export const subscribeToRoadmapOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
})

export type SubscribeToRoadmapOutput = z.infer<
  typeof subscribeToRoadmapOutputSchema
>
