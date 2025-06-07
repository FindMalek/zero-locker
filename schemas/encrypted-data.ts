import { z } from "zod"

export const EncryptedDataDto = z.object({
  encryptedValue: z.string().min(1, "Encrypted value is required"),
  encryptionKey: z.string().min(1, "Encryption key is required"),
  iv: z.string().min(1, "IV is required"),
})

export const EncryptedDataSimpleRoSchema = z.object({
  id: z.string(),
  encryptedValue: z.string(),
  encryptionKey: z.string(),
  iv: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type EncryptedDataDto = z.infer<typeof EncryptedDataDto>
export type EncryptedDataSimpleRo = z.infer<typeof EncryptedDataSimpleRoSchema>
