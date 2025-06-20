import { encryptedDataDtoSchema } from "@/schemas/encryption/encryption"
import { CardProvider, CardStatus, CardType } from "@prisma/client"
import { z } from "zod"

import { CardExpiryDateUtils } from "@/lib/utils/card-expiry-helpers"

import { tagDtoSchema } from "../utils/tag"

export const cardProviderSchema = z.enum([
  CardProvider.AMEX,
  CardProvider.DISCOVER,
  CardProvider.MASTERCARD,
  CardProvider.VISA,
  CardProvider.JCB,
  CardProvider.UNIONPAY,
  CardProvider.DINERS_CLUB,
])
export const cardProviderEnum = cardProviderSchema.enum
export const LIST_CARD_PROVIDERS = Object.values(cardProviderEnum)
export type CardProviderInfer = z.infer<typeof cardProviderSchema>

export const cardTypeSchema = z.enum([
  CardType.CREDIT,
  CardType.DEBIT,
  CardType.PREPAID,
  CardType.VIRTUAL,
  CardType.NATIONAL,
])
export const cardTypeEnum = cardTypeSchema.enum
export const LIST_CARD_TYPES = Object.values(cardTypeEnum)
export type CardTypeInfer = z.infer<typeof cardTypeSchema>

export const cardStatusSchema = z.enum([
  CardStatus.ACTIVE,
  CardStatus.EXPIRED,
  CardStatus.INACTIVE,
  CardStatus.BLOCKED,
  CardStatus.LOST,
])
export const cardStatusEnum = cardStatusSchema.enum
export const LIST_CARD_STATUSES = Object.values(cardStatusEnum)
export type CardStatusInfer = z.infer<typeof cardStatusSchema>

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

export const cardDtoSchema = z.object({
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

export type CardDto = z.infer<typeof cardDtoSchema>

export const cardSimpleRoSchema = z.object({
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

export type CardSimpleRo = z.infer<typeof cardSimpleRoSchema>

export const getCardByIdDtoSchema = z.object({
  id: z.string().min(1, "Card ID is required"),
})

export type GetCardByIdDto = z.infer<typeof getCardByIdDtoSchema>

export const updateCardDtoSchema = cardDtoSchema.partial().extend({
  id: z.string().min(1, "Card ID is required"),
})

export type UpdateCardDto = z.infer<typeof updateCardDtoSchema>

export const deleteCardDtoSchema = z.object({
  id: z.string().min(1, "Card ID is required"),
})

export type DeleteCardDto = z.infer<typeof deleteCardDtoSchema>
