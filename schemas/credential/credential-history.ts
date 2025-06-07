import { encryptedDataDtoSchema } from "@/schemas/encrypted-data"
import { z } from "zod"

export const credentialHistoryDtoSchema = z.object({
  passwordEncryption: encryptedDataDtoSchema,
  credentialId: z.string(),
})

export type CredentialHistoryDto = z.infer<typeof credentialHistoryDtoSchema>

export const credentialHistorySimpleRoSchema = z.object({
  id: z.string(),

  changedAt: z.date(),

  userId: z.string(),
  credentialId: z.string(),
  passwordEncryptionId: z.string(),
})

export type CredentialHistorySimpleRo = z.infer<
  typeof credentialHistorySimpleRoSchema
>
