import { z } from "zod"

// ============================================================================
// Roadmap Input Schemas
// ============================================================================

export const roadmapSubscribeInputSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
})

export type RoadmapSubscribeInput = z.infer<typeof roadmapSubscribeInputSchema>
