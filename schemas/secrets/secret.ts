import { encryptedDataDtoSchema } from "@/schemas/encrypted-data/encrypted-data"
import { z } from "zod"

export const secretDtoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  note: z.string().optional(),

  valueEncryption: encryptedDataDtoSchema,

  containerId: z.string(),
})

export type SecretDto = z.infer<typeof secretDtoSchema>

export const secretSimpleRoSchema = z.object({
  id: z.string(),

  name: z.string(),
  note: z.string().nullable(),

  lastViewed: z.date().nullable(),
  updatedAt: z.date(),
  createdAt: z.date(),

  userId: z.string(),
  containerId: z.string(),
  valueEncryptionId: z.string(),
})

export type SecretSimpleRo = z.infer<typeof secretSimpleRoSchema>
