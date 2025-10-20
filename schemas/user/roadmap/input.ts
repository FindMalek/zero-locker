import { z } from "zod"

// ============================================================================
// Roadmap Input Schemas
// ============================================================================

export const roadmapSubscribeInputSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
})

export type RoadmapSubscribeInput = z.infer<typeof roadmapSubscribeInputSchema>

// ============================================================================
// Legacy aliases for backward compatibility
// ============================================================================

export const subscribeToRoadmapInputSchema = roadmapSubscribeInputSchema
export const subscribeInputSchema = roadmapSubscribeInputSchema

export type SubscribeToRoadmapInput = RoadmapSubscribeInput
export type SubscribeInput = RoadmapSubscribeInput
