import { z } from "zod"

// ============================================================================
// Simple Output Schema
// ============================================================================

export const historySimpleOutputSchema = z.object({
  id: z.string(),

  changedAt: z.date(),

  userId: z.string(),
  credentialId: z.string(),
  passwordEncryptionId: z.string(),
})

export type HistorySimpleOutput = z.infer<typeof historySimpleOutputSchema>
