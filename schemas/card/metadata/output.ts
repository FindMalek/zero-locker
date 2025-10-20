import { z } from "zod"

// ============================================================================
// Card Metadata Output Schemas
// ============================================================================

export const cardMetadataSimpleOutputSchema = z.object({
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

export type CardMetadataSimpleOutput = z.infer<
  typeof cardMetadataSimpleOutputSchema
>

// ============================================================================
// Extended Output Schemas
// ============================================================================

export const cardMetadataOutputSchema = cardMetadataSimpleOutputSchema

export type CardMetadataOutput = CardMetadataSimpleOutput

// ============================================================================
// Legacy aliases for backward compatibility
// ============================================================================

export const cardMetadataSimpleRoSchema = cardMetadataSimpleOutputSchema
export const simpleOutputSchema = cardMetadataSimpleOutputSchema
export const outputSchema = cardMetadataSimpleOutputSchema

export type CardMetadataSimpleRo = CardMetadataSimpleOutput
export type SimpleOutput = CardMetadataSimpleOutput
export type Output = CardMetadataSimpleOutput
