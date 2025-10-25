import { z } from "zod"

// ============================================================================
// Subscription Output Schemas
// ============================================================================

export const subscriptionOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
})

// Backward compatibility
export const roadmapSubscribeOutputSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
})

export type SubscriptionOutput = z.infer<typeof subscriptionOutputSchema>
export type RoadmapSubscribeOutput = z.infer<
  typeof roadmapSubscribeOutputSchema
>
