import { CardProvider, CardStatus, CardType } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// Simple Return Object (RO)
// ============================================================================

export const cardSimpleOutputSchema = z.object({
  id: z.string(),

  name: z.string(),
  description: z.string().nullable(),

  type: z.nativeEnum(CardType),
  status: z.nativeEnum(CardStatus),
  provider: z.nativeEnum(CardProvider),

  expiryDate: z.date(),
  billingAddress: z.string().nullable(),
  cardholderName: z.string(),
  cardholderEmail: z.string().nullable(),

  lastViewed: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),

  userId: z.string(),
  containerId: z.string().nullable(),
  numberEncryptionId: z.string(),
  cvvEncryptionId: z.string(),
})

export type CardSimpleOutput = z.infer<typeof cardSimpleOutputSchema>

// ============================================================================
// List Response Output Schema
// ============================================================================

export const listCardsOutputSchema = z.object({
  cards: z.array(cardSimpleOutputSchema),
  total: z.number().int(),
  hasMore: z.boolean(),
  page: z.number().int(),
  limit: z.number().int(),
})

export type ListCardsOutput = z.infer<typeof listCardsOutputSchema>

// ============================================================================
// Backward Compatibility Aliases (DEPRECATED - use new names)
// ============================================================================

/** @deprecated Use cardSimpleOutputSchema instead */
export const cardSimpleRoSchema = cardSimpleOutputSchema
/** @deprecated Use CardSimpleOutput instead */
export type CardSimpleRo = CardSimpleOutput

/** @deprecated Use cardSimpleOutputSchema instead */
export const cardOutputSchema = cardSimpleOutputSchema
/** @deprecated Use CardSimpleOutput instead */
export type CardOutput = CardSimpleOutput

