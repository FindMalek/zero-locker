import { z } from "zod"

// ============================================================================
// Statistics Input Schemas
// ============================================================================

// Statistics typically don't require input parameters
// but we can define common query parameters if needed

export const userCountInputSchema = z.object({})

export type UserCountInput = z.infer<typeof userCountInputSchema>

export const encryptedDataCountInputSchema = z.object({})

export type EncryptedDataCountInput = z.infer<typeof encryptedDataCountInputSchema>

// ============================================================================
// Legacy aliases for backward compatibility
// ============================================================================

export const getUserCountInputSchema = userCountInputSchema
export const getEncryptedDataCountInputSchema = encryptedDataCountInputSchema

export type GetUserCountInput = UserCountInput
export type GetEncryptedDataCountInput = EncryptedDataCountInput
