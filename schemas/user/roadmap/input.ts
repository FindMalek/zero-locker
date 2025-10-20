import { z } from "zod"

// ============================================================================
// Roadmap Input Schemas
// ============================================================================

export const subscribeToRoadmapInputSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
})

export type SubscribeToRoadmapInput = z.infer<
  typeof subscribeToRoadmapInputSchema
>

// ============================================================================
// Legacy aliases for backward compatibility
// ============================================================================

export const subscribeInputSchema = subscribeToRoadmapInputSchema

export type SubscribeInput = SubscribeToRoadmapInput
