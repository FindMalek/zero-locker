import { z } from "zod"

export const cardMetadataDtoSchema = z.object({
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

export type CardMetadataDto = z.infer<typeof cardMetadataDtoSchema>

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

export const getCardMetadataDtoSchema = z.object({
  cardId: z.string().min(1, "Card ID is required"),
})

export type GetCardMetadataDto = z.infer<typeof getCardMetadataDtoSchema>

export const updateCardMetadataDtoSchema = z.object({
  id: z.string().min(1, "Metadata ID is required"),
  data: cardMetadataDtoSchema.partial(),
})

export type UpdateCardMetadataDto = z.infer<typeof updateCardMetadataDtoSchema>

export const deleteCardMetadataDtoSchema = z.object({
  id: z.string().min(1, "Metadata ID is required"),
})

export type DeleteCardMetadataDto = z.infer<typeof deleteCardMetadataDtoSchema>

export const listCardMetadataDtoSchema = z.object({
  cardId: z.string().min(1, "Card ID is required"),
})

export type ListCardMetadataDto = z.infer<typeof listCardMetadataDtoSchema>
