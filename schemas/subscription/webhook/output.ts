import { z } from "zod"

// Webhook output schema
export const webhookOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  processed: z.boolean(),
})

export type WebhookOutput = z.infer<typeof webhookOutputSchema>
