import { SecretStatus, SecretType } from "@prisma/client"
import { z } from "zod"

export const SecretDto = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Value is required"),
  note: z.string().optional(),
  containerId: z.string(),
})

export const SecretSimpleRoSchema = z.object({
  id: z.string(),

  name: z.string(),
  note: z.string().nullable(),
  value: z.string(),

  lastCopied: z.date().nullable(),
  lastViewed: z.date().nullable(),
  updatedAt: z.date(),
  createdAt: z.date(),

  userId: z.string(),
  containerId: z.string(),
})

export type SecretDto = z.infer<typeof SecretDto>
export type SecretSimpleRo = z.infer<typeof SecretSimpleRoSchema>
