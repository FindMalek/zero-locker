import { SecretStatus, SecretType } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// Secret Metadata Output Schemas
// ============================================================================

export const secretMetadataSimpleOutputSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(SecretType),
  status: z.nativeEnum(SecretStatus),
  expiresAt: z.date().nullable(),
  otherInfo: z.array(z.any()),
  secretId: z.string(),
})

export type SecretMetadataSimpleOutput = z.infer<
  typeof secretMetadataSimpleOutputSchema
>

// ============================================================================
// Extended Output Schemas
// ============================================================================

export const secretMetadataOutputSchema = secretMetadataSimpleOutputSchema

export type SecretMetadataOutput = SecretMetadataSimpleOutput
