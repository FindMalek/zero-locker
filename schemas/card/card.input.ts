import { encryptedDataDtoSchema } from "@/schemas/encryption/encryption"
import { tagDtoSchema } from "@/schemas/utils/tag"
import { CardProvider, CardStatus, CardType } from "@prisma/client"
import { z } from "zod"

import { CardExpiryDateUtils } from "@/lib/utils/card-expiry-helpers"

// ============================================================================
// Card Expiry Date Schema
// ============================================================================

export const cardExpiryDateSchema = z
  .union([z.date(), z.string().min(1, "Expiry date is required")])
  .refine(
    (val) => {
      if (val instanceof Date) return !isNaN(val.getTime())
      if (typeof val === "string") {
        return CardExpiryDateUtils.isValidMMYYFormat(val)
      }
      return false
    },
    {
      message: "Please enter a valid expiry date (MM/YY format)",
    }
  )

export type CardExpiryDate = z.infer<typeof cardExpiryDateSchema>

// ============================================================================
// Base Input Schema
// ============================================================================

export const cardInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),

  type: z.nativeEnum(CardType),
  provider: z.nativeEnum(CardProvider),
  status: z.nativeEnum(CardStatus),

  numberEncryption: encryptedDataDtoSchema,
  cvvEncryption: encryptedDataDtoSchema,

  cardholderName: z.string().min(1, "Cardholder name is required"),
  billingAddress: z.string().optional(),
  cardholderEmail: z.union([z.string().email(), z.literal("")]).optional(),
  expiryDate: cardExpiryDateSchema,

  tags: z.array(tagDtoSchema),
  containerId: z.string().optional(),
})

export type CardInput = z.infer<typeof cardInputSchema>

// ============================================================================
// CRUD Operation Input Schemas
// ============================================================================

// Create
export const createCardInputSchema = cardInputSchema

export type CreateCardInput = z.infer<typeof createCardInputSchema>

// Get by ID
export const getCardInputSchema = z.object({
  id: z.string().min(1, "Card ID is required"),
})

export type GetCardInput = z.infer<typeof getCardInputSchema>

// Update
export const updateCardInputSchema = cardInputSchema.partial().extend({
  id: z.string().min(1, "Card ID is required"),
})

export type UpdateCardInput = z.infer<typeof updateCardInputSchema>

// Delete
export const deleteCardInputSchema = z.object({
  id: z.string().min(1, "Card ID is required"),
})

export type DeleteCardInput = z.infer<typeof deleteCardInputSchema>

// ============================================================================
// List Operation Input Schema
// ============================================================================

export const listCardsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  containerId: z.string().optional(),
})

export type ListCardsInput = z.infer<typeof listCardsInputSchema>

// ============================================================================
// Public API Exports (with entity prefix for clarity)
// ============================================================================

export const cardDtoSchema = cardInputSchema
export type CardDto = CardInput

export const getCardByIdDtoSchema = getCardInputSchema
export type GetCardByIdDto = GetCardInput

export const updateCardDtoSchema = updateCardInputSchema
export type UpdateCardDto = UpdateCardInput

export const deleteCardDtoSchema = deleteCardInputSchema
export type DeleteCardDto = DeleteCardInput
