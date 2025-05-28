import { CardProviderEnum } from "@/schemas/card"
import type { CardProviderInfer } from "@/schemas/card"

export const PRIORITY_ACTIVITY_TYPE = {
  CREATED: 1,
  UPDATED: 2,
  COPIED: 3,
}

export const MAX_RECENT_ITEMS = 10

export const CARD_PROVIDER_ICON_TYPE = {
  [CardProviderEnum.VISA]: "Visa",
  [CardProviderEnum.MASTERCARD]: "Mastercard",
  [CardProviderEnum.AMEX]: "Amex",
  [CardProviderEnum.DISCOVER]: "Discover",
  [CardProviderEnum.JCB]: "Jcb",
  [CardProviderEnum.UNIONPAY]: "Unionpay",
  [CardProviderEnum.DINERS_CLUB]: "Diners",
  [CardProviderEnum.OTHER]: "Generic",
} as const

export const CARD_TYPE_MAPPING: Record<string, CardProviderInfer> = {
  visa: CardProviderEnum.VISA,
  mastercard: CardProviderEnum.MASTERCARD,
  amex: CardProviderEnum.AMEX,
  discover: CardProviderEnum.DISCOVER,
  jcb: CardProviderEnum.JCB,
  unionpay: CardProviderEnum.UNIONPAY,
  diners: CardProviderEnum.DINERS_CLUB,
  dinersclub: CardProviderEnum.DINERS_CLUB,
}
