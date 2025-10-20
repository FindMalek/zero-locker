import { z } from "zod"

// ============================================================================
// Roadmap Output Schemas
// ============================================================================

export const roadmapSubscribeOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
})

export type RoadmapSubscribeOutput = z.infer<
  typeof roadmapSubscribeOutputSchema
>

// ============================================================================
// Legacy aliases for backward compatibility
// ============================================================================

export const subscribeToRoadmapOutputSchema = roadmapSubscribeOutputSchema
export const subscribeOutputSchema = roadmapSubscribeOutputSchema

export type SubscribeToRoadmapOutput = RoadmapSubscribeOutput
export type SubscribeOutput = RoadmapSubscribeOutput
