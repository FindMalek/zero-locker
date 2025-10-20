import { z } from "zod"

// ============================================================================
// Statistics Output Schemas
// ============================================================================

export const userCountOutputSchema = z.object({
  total: z.number().int().min(0),
})

export type UserCountOutput = z.infer<typeof userCountOutputSchema>

export const encryptedDataCountOutputSchema = z.object({
  count: z.number().int().min(0),
})

export type EncryptedDataCountOutput = z.infer<
  typeof encryptedDataCountOutputSchema
>
