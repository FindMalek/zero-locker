import { cardProviderEnum } from "@/schemas/card"
import type { CardProviderInfer } from "@/schemas/card"

export const PRIORITY_ACTIVITY_TYPE = {
  CREATED: 1,
  UPDATED: 2,
  COPIED: 3,
}

export const MAX_RECENT_ITEMS = 10

export const CARD_PROVIDER_ICON_TYPE = {
  [cardProviderEnum.VISA]: "Visa",
  [cardProviderEnum.MASTERCARD]: "Mastercard",
  [cardProviderEnum.AMEX]: "Amex",
  [cardProviderEnum.DISCOVER]: "Discover",
  [cardProviderEnum.JCB]: "Jcb",
  [cardProviderEnum.UNIONPAY]: "Unionpay",
  [cardProviderEnum.DINERS_CLUB]: "Diners",
} as const

export const CARD_TYPE_MAPPING: Record<string, CardProviderInfer> = {
  visa: cardProviderEnum.VISA,
  mastercard: cardProviderEnum.MASTERCARD,
  amex: cardProviderEnum.AMEX,
  discover: cardProviderEnum.DISCOVER,
  jcb: cardProviderEnum.JCB,
  unionpay: cardProviderEnum.UNIONPAY,
  diners: cardProviderEnum.DINERS_CLUB,
  dinersclub: cardProviderEnum.DINERS_CLUB,
}
