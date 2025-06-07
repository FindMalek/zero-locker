import { TagDto } from "@/schemas/tag"
import { AccountStatus } from "@prisma/client"
import { z } from "zod"

export const credentialDtoSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  status: z.nativeEnum(AccountStatus),
  tags: z.array(TagDto),
  description: z.string().optional(),
  platformId: z.string(),
  containerId: z.string().optional(),
})

export type CredentialDto = z.infer<typeof credentialDtoSchema>

export const credentialSimpleRoSchema = z.object({
  id: z.string(),

  username: z.string(),
  password: z.string(),

  status: z.nativeEnum(AccountStatus),

  description: z.string().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),

  platformId: z.string(),
  userId: z.string(),
  containerId: z.string().nullable(),
})

export type CredentialSimpleRo = z.infer<typeof credentialSimpleRoSchema>

export const credentialMetadataDtoSchema = z.object({
  recoveryEmail: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  otherInfo: z.array(z.any()).optional(),
  has2FA: z.boolean(),
  credentialId: z.string(),
})

export type CredentialMetadataDto = z.infer<typeof credentialMetadataDtoSchema>

export const credentialMetadataSimpleRoSchema = z.object({
  id: z.string(),

  recoveryEmail: z.string().nullable(),

  phoneNumber: z.string().nullable(),
  otherInfo: z.array(z.any()).nullable(),

  has2FA: z.boolean(),

  credentialId: z.string(),
})

export type CredentialMetadataSimpleRo = z.infer<
  typeof credentialMetadataSimpleRoSchema
>

export const credentialHistoryDtoSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string(),
  encryptionKey: z.string(),
  iv: z.string(),
  credentialId: z.string(),
})

export type CredentialHistoryDto = z.infer<typeof credentialHistoryDtoSchema>

export const credentialHistorySimpleRoSchema = z.object({
  id: z.string(),

  oldPassword: z.string(),
  newPassword: z.string(),
  encryptionKey: z.string(),
  iv: z.string(),

  changedAt: z.date(),

  userId: z.string(),
  credentialId: z.string(),
})

export type CredentialHistorySimpleRo = z.infer<
  typeof credentialHistorySimpleRoSchema
>
