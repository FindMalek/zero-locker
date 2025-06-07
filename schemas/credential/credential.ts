import { encryptedDataDtoSchema } from "@/schemas/encryption/encryption"
import { tagDtoSchema } from "@/schemas/utils/tag"
import { AccountStatus } from "@prisma/client"
import { z } from "zod"

import { credentialMetadataDtoSchema } from "./credential-metadata"

export const accountStatusSchema = z.enum([
  AccountStatus.ACTIVE,
  AccountStatus.SUSPENDED,
  AccountStatus.DELETED,
])
export const accountStatusEnum = accountStatusSchema.enum
export const LIST_ACCOUNT_STATUSES = Object.values(accountStatusEnum)
export type AccountStatusInfer = z.infer<typeof accountStatusSchema>

export const credentialDtoSchema = z.object({
  identifier: z.string().min(1, "Username/identifier is required"),
  passwordEncryption: encryptedDataDtoSchema,

  status: z.nativeEnum(AccountStatus),
  description: z.string().optional(),

  tags: z.array(tagDtoSchema),
  metadata: z.array(credentialMetadataDtoSchema),

  platformId: z.string().min(1, "Platform is required"),
  containerId: z.string().optional(),
})

export type CredentialDto = z.infer<typeof credentialDtoSchema>

export const credentialSimpleRoSchema = z.object({
  id: z.string(),

  identifier: z.string(),
  description: z.string().nullable(),
  status: z.nativeEnum(AccountStatus),

  lastViewed: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),

  platformId: z.string(),
  userId: z.string(),
  containerId: z.string().nullable(),
  passwordEncryptionId: z.string(),
})

export type CredentialSimpleRo = z.infer<typeof credentialSimpleRoSchema>
