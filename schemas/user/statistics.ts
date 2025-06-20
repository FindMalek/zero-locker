import { z } from "zod"

// User statistics operations
export const getUserCountOutputSchema = z.object({
  total: z.number().int().min(0),
})

export const getEncryptedDataCountOutputSchema = z.object({
  count: z.number().int().min(0),
})

// Types
export type GetUserCountOutput = z.infer<typeof getUserCountOutputSchema>
export type GetEncryptedDataCountOutput = z.infer<
  typeof getEncryptedDataCountOutputSchema
>
