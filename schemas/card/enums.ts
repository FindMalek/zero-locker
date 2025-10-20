import { CardProvider, CardStatus, CardType } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// Card Provider Enum
// ============================================================================

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

// ============================================================================
// Card Type Enum
// ============================================================================

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

// ============================================================================
// Card Status Enum
// ============================================================================

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
