import { SecretStatus, SecretType } from "@prisma/client"
import { z } from "zod"

export const secretMetadataDtoSchema = z.object({
  type: z.nativeEnum(SecretType),
  status: z.nativeEnum(SecretStatus).default(SecretStatus.ACTIVE),

  expiresAt: z.date().optional(),

  otherInfo: z.array(z.any()).default([]),

  secretId: z.string(),
})

export type SecretMetadataDto = z.infer<typeof secretMetadataDtoSchema>

export const secretMetadataSimpleRoSchema = z.object({
  id: z.string(),

  type: z.nativeEnum(SecretType),
  status: z.nativeEnum(SecretStatus),

  expiresAt: z.date().nullable(),

  otherInfo: z.array(z.any()),

  secretId: z.string(),
})

export type SecretMetadataSimpleRo = z.infer<
  typeof secretMetadataSimpleRoSchema
>

export const secretMetadataRoSchema = secretMetadataSimpleRoSchema
export type SecretMetadataRo = SecretMetadataSimpleRo
