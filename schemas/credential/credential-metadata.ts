import { z } from "zod"

export const credentialMetadataDtoSchema = z.object({
  recoveryEmail: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  has2FA: z.boolean().default(false),

  otherInfo: z.array(z.any()).optional(),

  credentialId: z.string(),
})

export type CredentialMetadataDto = z.infer<typeof credentialMetadataDtoSchema>

export const credentialMetadataSimpleRoSchema = z.object({
  id: z.string(),

  recoveryEmail: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  has2FA: z.boolean(),

  otherInfo: z.array(z.any()).nullable(),

  credentialId: z.string(),
})

export type CredentialMetadataSimpleRo = z.infer<
  typeof credentialMetadataSimpleRoSchema
>
