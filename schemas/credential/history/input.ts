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
// Backward Compatibility Aliases (DEPRECATED)
// ============================================================================

/** @deprecated Use historyInputSchema instead */
export const credentialHistoryDtoSchema = historyInputSchema
/** @deprecated Use HistoryInput instead */
export type CredentialHistoryDto = HistoryInput
