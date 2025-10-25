import { z } from "zod"

// ============================================================================
// Subscription Input Schemas
// ============================================================================

export const subscriptionInputSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  type: z.enum(["roadmap", "articles"], {
    errorMap: () => ({
      message: "Type must be either 'roadmap' or 'articles'",
    }),
  }),
})

// Backward compatibility
export const roadmapSubscribeInputSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
})

export type SubscriptionInput = z.infer<typeof subscriptionInputSchema>
export type RoadmapSubscribeInput = z.infer<typeof roadmapSubscribeInputSchema>
