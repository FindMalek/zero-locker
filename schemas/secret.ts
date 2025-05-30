import { SecretStatus, SecretType } from "@prisma/client"
import { z } from "zod"

export const SecretDto = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Value is required"),
  description: z.string().optional(),
  type: z.nativeEnum(SecretType),
  status: z.nativeEnum(SecretStatus),
  expiresAt: z.coerce.date().optional(),
  encryptionKey: z.string().optional(),
  iv: z.string().optional(),
  userId: z.string(),
  containerId: z.string().optional(),
  platformId: z.string(),
})

export const SecretSimpleRoSchema = z.object({
  id: z.string(),

  name: z.string(),
  value: z.string(),

  type: z.nativeEnum(SecretType),
  status: z.nativeEnum(SecretStatus),

  description: z.string().nullable(),

  expiresAt: z.date().nullable(),
  updatedAt: z.date(),
  createdAt: z.date(),

  userId: z.string(),
  platformId: z.string(),

  containerId: z.string().nullable(),
})

export type SecretDto = z.infer<typeof SecretDto>
export type SecretSimpleRo = z.infer<typeof SecretSimpleRoSchema>
