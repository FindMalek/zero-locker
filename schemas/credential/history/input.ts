import { encryptedDataDtoSchema } from "@/schemas/encryption/encryption"
import { z } from "zod"

// ============================================================================
// Base Input Schema
// ============================================================================

export const historyInputSchema = z.object({
  passwordEncryption: encryptedDataDtoSchema,
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


