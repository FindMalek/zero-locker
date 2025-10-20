import { z } from "zod"

// ============================================================================
// Roadmap Output Schemas
// ============================================================================

export const subscribeToRoadmapOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
})

export type SubscribeToRoadmapOutput = z.infer<
  typeof subscribeToRoadmapOutputSchema
>

// ============================================================================
// Legacy aliases for backward compatibility
// ============================================================================

export const subscribeOutputSchema = subscribeToRoadmapOutputSchema

export type SubscribeOutput = SubscribeToRoadmapOutput
