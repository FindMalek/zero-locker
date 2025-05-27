import { TagDto } from "@/schemas/tag"
import { CardProvider, CardStatus, CardType } from "@prisma/client"
import { z } from "zod"

export const CardDto = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  notes: z.string().optional(),
  type: z.nativeEnum(CardType),
  provider: z.nativeEnum(CardProvider),
  status: z.nativeEnum(CardStatus).default(CardStatus.ACTIVE),
  number: z.string().min(1, "Card number is required"),
  expiryDate: z.coerce.date(),
  cvv: z.string().min(1, "CVV is required"),
  encryptionKey: z.string().optional(),
  iv: z.string().optional(),
  billingAddress: z.string().optional(),
  cardholderName: z.string().min(1, "Cardholder name is required"),
  cardholderEmail: z.string().email().optional(),
  tags: z.array(TagDto).default([]),
  containerId: z.string().optional(),
})

export const CardMetadataDto = z.object({
  creditLimit: z.number().optional(),
  availableCredit: z.number().optional(),
  interestRate: z.number().optional(),
  annualFee: z.number().optional(),
  rewardsProgram: z.string().optional(),
  contactlessEnabled: z.boolean().default(false),
  onlinePaymentsEnabled: z.boolean().default(true),
  internationalPaymentsEnabled: z.boolean().default(true),
  pinSet: z.boolean().default(false),
  otherInfo: z.string().optional(),
  cardId: z.string(),
})

export const CardMetadataSimpleRo = z.object({
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
  otherInfo: z.string().nullable(),
  cardId: z.string(),
})

export const CardHistoryDto = z.object({
  oldNumber: z.string(),
  newNumber: z.string(),
  oldCvv: z.string(),
  newCvv: z.string(),
  oldExpiryDate: z.date(),
  newExpiryDate: z.date(),
  encryptionKey: z.string(),
  iv: z.string(),
  cardId: z.string(),
})

export const CardSimpleRoSchema = z.object({
  id: z.string(),

  name: z.string(),
  description: z.string().nullable(),
  notes: z.string().nullable(),

  type: z.nativeEnum(CardType),
  status: z.nativeEnum(CardStatus),
  provider: z.nativeEnum(CardProvider),

  number: z.string(),
  expiryDate: z.date(),
  cvv: z.string(),
  encryptionKey: z.string().nullable(),
  iv: z.string().nullable(),
  billingAddress: z.string().nullable(),
  cardholderName: z.string(),
  cardholderEmail: z.string().nullable(),

  lastCopied: z.date().nullable(),
  lastViewed: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),

  userId: z.string(),
  containerId: z.string().nullable(),
})

export type CardDto = z.infer<typeof CardDto>
export type CardSimpleRo = z.infer<typeof CardSimpleRoSchema>
export type CardMetadataDto = z.infer<typeof CardMetadataDto>
export type CardMetadataSimpleRo = z.infer<typeof CardMetadataSimpleRo>
export type CardHistoryDto = z.infer<typeof CardHistoryDto>
