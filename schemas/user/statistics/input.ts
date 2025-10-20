import { z } from "zod"

// ============================================================================
// Statistics Input Schemas
// ============================================================================

// Statistics typically don't require input parameters
// but we can define common query parameters if needed

export const getUserCountInputSchema = z.object({})

export type GetUserCountInput = z.infer<typeof getUserCountInputSchema>

export const getEncryptedDataCountInputSchema = z.object({})

export type GetEncryptedDataCountInput = z.infer<
  typeof getEncryptedDataCountInputSchema
>
