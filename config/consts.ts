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

export const TAG_COLOR_PALETTES = {
  vibrant: [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#F8C471",
    "#82E0AA",
    "#F1948A",
    "#85C1E9",
    "#D2B4DE",
  ],
  pastel: [
    "#FFB3BA",
    "#BAFFC9",
    "#BAE1FF",
    "#FFFFBA",
    "#FFD3E0",
    "#E0BBE4",
    "#C5E3F6",
    "#FFDFBA",
    "#B3E5D1",
    "#FFCCCB",
    "#D1C4E9",
    "#C8E6C9",
    "#FFCDD2",
    "#E1F5FE",
    "#F3E5F5",
  ],
  professional: [
    "#3498DB",
    "#2ECC71",
    "#E74C3C",
    "#F39C12",
    "#9B59B6",
    "#1ABC9C",
    "#34495E",
    "#E67E22",
    "#8E44AD",
    "#27AE60",
    "#2980B9",
    "#C0392B",
    "#D35400",
    "#7F8C8D",
    "#16A085",
  ],
  earthy: [
    "#8B4513",
    "#228B22",
    "#4682B4",
    "#CD853F",
    "#9ACD32",
    "#20B2AA",
    "#808080",
    "#B22222",
    "#32CD32",
    "#4169E1",
    "#FF8C00",
    "#8FBC8F",
    "#DC143C",
    "#00CED1",
    "#9932CC",
  ],
}
