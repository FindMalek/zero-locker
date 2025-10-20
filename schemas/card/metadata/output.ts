import { z } from "zod"

// ============================================================================
// Card Metadata Output Schemas
// ============================================================================

export const cardMetadataSimpleRoSchema = z.object({
  id: z.string(),
  creditLimit: z.number().nullable(),
  availableCredit: z.number().nullable(),
  interestRate: z.number().nullable(),
  annualFee: z.number().nullable(),
  rewardsProgram: z.string().nullable(),
  contactlessEnabled: z.boolean(),
  onlinePaymentsEnabled: z.boolean(),
  internationalPaymentsEnabled: z.boolean(),
  pinSet: z.boolean(),
  otherInfo: z.array(z.any()).nullable(),
  cardId: z.string(),
})

export type CardMetadataSimpleRo = z.infer<typeof cardMetadataSimpleRoSchema>

// ============================================================================
// Extended Output Schemas
// ============================================================================

export const simpleOutputSchema = cardMetadataSimpleRoSchema
export const outputSchema = cardMetadataSimpleRoSchema

export type SimpleOutput = CardMetadataSimpleRo
export type Output = CardMetadataSimpleRo
