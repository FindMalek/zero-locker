import { z } from "zod"

// ============================================================================
// Encryption Output Schemas
// ============================================================================

export const encryptedDataSimpleRoSchema = z.object({
  id: z.string(),
  iv: z.string(),
  encryptionKey: z.string(),
  encryptedValue: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type EncryptedDataSimpleRo = z.infer<typeof encryptedDataSimpleRoSchema>
