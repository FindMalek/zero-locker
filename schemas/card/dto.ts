import { z } from "zod"

import {
  cardDtoSchema,
  cardSimpleRoSchema,
  deleteCardDtoSchema,
  getCardByIdDtoSchema,
  updateCardDtoSchema,
} from "./card"

// Input DTOs for oRPC procedures
export const createCardInputSchema = cardDtoSchema
export const getCardInputSchema = getCardByIdDtoSchema
export const updateCardInputSchema = updateCardDtoSchema
export const deleteCardInputSchema = deleteCardDtoSchema

// List cards with pagination
export const listCardsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  containerId: z.string().optional(),
})

// Output DTOs for oRPC procedures
export const cardOutputSchema = cardSimpleRoSchema

export const listCardsOutputSchema = z.object({
  cards: z.array(cardOutputSchema),
  total: z.number().int(),
  hasMore: z.boolean(),
  page: z.number().int(),
  limit: z.number().int(),
})

// Export types
export type CreateCardInput = z.infer<typeof createCardInputSchema>
export type GetCardInput = z.infer<typeof getCardInputSchema>
export type UpdateCardInput = z.infer<typeof updateCardInputSchema>
export type DeleteCardInput = z.infer<typeof deleteCardInputSchema>
export type ListCardsInput = z.infer<typeof listCardsInputSchema>

export type CardOutput = z.infer<typeof cardOutputSchema>
export type ListCardsOutput = z.infer<typeof listCardsOutputSchema>
