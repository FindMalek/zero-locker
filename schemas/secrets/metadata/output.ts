import { SecretStatus, SecretType } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// Secret Metadata Output Schemas
// ============================================================================

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

// ============================================================================
// Extended Output Schemas
// ============================================================================

export const simpleOutputSchema = secretMetadataSimpleRoSchema
export const outputSchema = secretMetadataSimpleRoSchema

export type SimpleOutput = SecretMetadataSimpleRo
export type Output = SecretMetadataSimpleRo
