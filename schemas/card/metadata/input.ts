import { z } from "zod"

// ============================================================================
// Card Metadata Input Schemas
// ============================================================================

export const cardMetadataInputSchema = z.object({
  creditLimit: z.number().optional(),
  availableCredit: z.number().optional(),
  interestRate: z.number().optional(),
  annualFee: z.number().optional(),
  rewardsProgram: z.string().optional(),
  contactlessEnabled: z.boolean().default(false),
  onlinePaymentsEnabled: z.boolean().default(true),
  internationalPaymentsEnabled: z.boolean().default(true),
  pinSet: z.boolean().default(false),
  otherInfo: z.array(z.any()).optional(),
  cardId: z.string(),
})

export type CardMetadataInput = z.infer<typeof cardMetadataInputSchema>

// ============================================================================
// CRUD Operation Input Schemas
// ============================================================================

// Get by Card ID
export const getCardMetadataInputSchema = z.object({
  cardId: z.string().min(1, "Card ID is required"),
})

export type GetCardMetadataInput = z.infer<typeof getCardMetadataInputSchema>

// Update
export const updateCardMetadataInputSchema = z.object({
  id: z.string().min(1, "Metadata ID is required"),
  data: cardMetadataInputSchema.partial(),
})

export type UpdateCardMetadataInput = z.infer<
  typeof updateCardMetadataInputSchema
>

// Delete
export const deleteCardMetadataInputSchema = z.object({
  id: z.string().min(1, "Metadata ID is required"),
})

export type DeleteCardMetadataInput = z.infer<
  typeof deleteCardMetadataInputSchema
>

// List
export const listCardMetadataInputSchema = z.object({
  cardId: z.string().min(1, "Card ID is required"),
})

export type ListCardMetadataInput = z.infer<typeof listCardMetadataInputSchema>
