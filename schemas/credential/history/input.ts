import { encryptedDataInputSchema } from "@/schemas/encryption"
import { z } from "zod"

// ============================================================================
// Base Input Schema
// ============================================================================

export const historyInputSchema = z.object({
  passwordEncryption: encryptedDataInputSchema,
  credentialId: z.string(),
})

export type HistoryInput = z.infer<typeof historyInputSchema>

// ============================================================================
// CRUD Operation Input Schemas
// ============================================================================

// Create
export const createHistoryInputSchema = historyInputSchema

export type CreateHistoryInput = z.infer<typeof createHistoryInputSchema>
