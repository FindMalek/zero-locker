import { CardProvider, CardStatus, CardType } from "@prisma/client"
import { z } from "zod"

export const CardDto = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.nativeEnum(CardType),
  provider: z.nativeEnum(CardProvider),
  status: z.nativeEnum(CardStatus).optional().default(CardStatus.ACTIVE),
  number: z.string().min(1, "Card number is required"),
  expiryDate: z.coerce.date(),
  cvv: z.string().min(1, "CVV is required"),
  billingAddress: z.string().min(1, "Billing address is required"),
  cardholderName: z.string().min(1, "Cardholder name is required"),
  cardholderEmail: z.string().email().optional(),
  containerId: z.string().optional(),
})

export const CardSimpleRoSchema = z.object({
  id: z.string(),

  name: z.string(),

  type: z.nativeEnum(CardType),
  status: z.nativeEnum(CardStatus),
  provider: z.nativeEnum(CardProvider),

  description: z.string().nullable(),
  cardholderEmail: z.string().nullable(),

  number: z.string(),
  expiryDate: z.date(),
  cvv: z.string(),
  billingAddress: z.string(),
  cardholderName: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),

  userId: z.string(),
  containerId: z.string().nullable(),
})

export type CardDto = z.infer<typeof CardDto>
export type CardSimpleRo = z.infer<typeof CardSimpleRoSchema>
