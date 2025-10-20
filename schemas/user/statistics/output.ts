import { z } from "zod"

// ============================================================================
// Statistics Output Schemas
// ============================================================================

export const getUserCountOutputSchema = z.object({
  total: z.number().int().min(0),
})

export type GetUserCountOutput = z.infer<typeof getUserCountOutputSchema>

export const getEncryptedDataCountOutputSchema = z.object({
  count: z.number().int().min(0),
})

export type GetEncryptedDataCountOutput = z.infer<
  typeof getEncryptedDataCountOutputSchema
>

// ============================================================================
// Legacy aliases for backward compatibility
// ============================================================================

export const userCountOutputSchema = getUserCountOutputSchema
export const encryptedDataCountOutputSchema = getEncryptedDataCountOutputSchema

export type UserCountOutput = GetUserCountOutput
export type EncryptedDataCountOutput = GetEncryptedDataCountOutput
