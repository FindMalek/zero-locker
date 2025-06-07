"use server"

import { CardEntity } from "@/entities/card/card"
import { database } from "@/prisma/client"
import {
  CardDto,
  cardDtoSchema,
  CardSimpleRo,
  DeleteCardDto,
  deleteCardDtoSchema,
  GetCardByIdDto,
  getCardByIdDtoSchema,
  UpdateCardDto,
  updateCardDtoSchema,
} from "@/schemas/card"
import { CardMetadataDto } from "@/schemas/card/card-metadata"
import { Prisma } from "@prisma/client"
import { z } from "zod"

import { verifySession } from "@/lib/auth/verify"
import { CardExpiryDateUtils } from "@/lib/card-expiry-utils"
import { getOrReturnEmptyObject } from "@/lib/utils"

import { createEncryptedData } from "../encryption"
import { createTagsAndGetConnections } from "../utils/tag"
import { createCardMetadata } from "./card-metadata"

/**
 * Get card by ID (Simple RO)
 */
export async function getSimpleCardById(id: string): Promise<{
  success: boolean
  card?: CardSimpleRo
  error?: string
}> {
  try {
    const session = await verifySession()

    const card = await database.card.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!card) {
      return {
        success: false,
        error: "Card not found",
      }
    }

    return {
      success: true,
      card: CardEntity.getSimpleRo(card),
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Get simple card error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get card by ID (Full RO with relations)
 */
export async function getCardById(data: GetCardByIdDto): Promise<{
  success: boolean
  card?: CardSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const validatedData = getCardByIdDtoSchema.parse(data)

    // TODO: Placeholder for full RO with relations
    // TODO: Update 'lastViewed' field

    const result = await getSimpleCardById(validatedData.id)
    return result
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
      }
    }

    console.error("Get card error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Create a new card
 */
export async function createCard(data: CardDto): Promise<{
  success: boolean
  card?: CardSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedData = cardDtoSchema.parse(data)

    // Handle expiry date using shared utility
    const expiryDate = CardExpiryDateUtils.processServerExpiryDate(
      validatedData.expiryDate
    )

    const tagConnections = await createTagsAndGetConnections(
      validatedData.tags,
      session.user.id,
      validatedData.containerId
    )

    // Create encrypted data for CVV
    const cvvEncryptionResult = await createEncryptedData({
      encryptedValue: validatedData.cvvEncryption.encryptedValue,
      encryptionKey: validatedData.cvvEncryption.encryptionKey,
      iv: validatedData.cvvEncryption.iv,
    })

    if (!cvvEncryptionResult.success || !cvvEncryptionResult.encryptedData) {
      return {
        success: false,
        error: "Failed to encrypt CVV",
      }
    }

    // Create encrypted data for card number
    const numberEncryptionResult = await createEncryptedData({
      encryptedValue: validatedData.numberEncryption.encryptedValue,
      encryptionKey: validatedData.numberEncryption.encryptionKey,
      iv: validatedData.numberEncryption.iv,
    })

    if (
      !numberEncryptionResult.success ||
      !numberEncryptionResult.encryptedData
    ) {
      return {
        success: false,
        error: "Failed to encrypt card number",
      }
    }

    const card = await database.card.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
        provider: validatedData.provider,
        status: validatedData.status,
        expiryDate,
        billingAddress: validatedData.billingAddress,
        cardholderName: validatedData.cardholderName,
        cardholderEmail: validatedData.cardholderEmail,
        userId: session.user.id,
        tags: tagConnections,
        cvvEncryptionId: cvvEncryptionResult.encryptedData.id,
        numberEncryptionId: numberEncryptionResult.encryptedData.id,
        ...getOrReturnEmptyObject(validatedData.containerId, "containerId"),
      },
    })

    return {
      success: true,
      card: CardEntity.getSimpleRo(card),
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
      }
    }

    console.error("Card creation error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Update a card
 */
export async function updateCard(data: UpdateCardDto): Promise<{
  success: boolean
  card?: CardSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedData = updateCardDtoSchema.parse(data)
    const { id, ...updateData } = validatedData

    // Use getSimpleCardById to check if card exists and belongs to user
    const existingCardResult = await getSimpleCardById(id)
    if (!existingCardResult.success) {
      return existingCardResult
    }

    // Validate using our DTO schema (partial)
    const partialCardSchema = cardDtoSchema.partial()
    const validatedUpdateData = partialCardSchema.parse(updateData)

    const updatePayload: Record<string, unknown> = {}

    // Handle expiry date if provided
    if (validatedUpdateData.expiryDate) {
      updatePayload.expiryDate = CardExpiryDateUtils.processServerExpiryDate(
        validatedUpdateData.expiryDate
      )
    }

    // Handle tags if provided
    if (validatedUpdateData.tags) {
      const tagConnections = await createTagsAndGetConnections(
        validatedUpdateData.tags,
        session.user.id,
        validatedUpdateData.containerId
      )
      updatePayload.tags = tagConnections
    }

    // Handle CVV encryption update if provided
    if (validatedUpdateData.cvvEncryption) {
      const cvvEncryptionResult = await createEncryptedData({
        encryptedValue: validatedUpdateData.cvvEncryption.encryptedValue,
        encryptionKey: validatedUpdateData.cvvEncryption.encryptionKey,
        iv: validatedUpdateData.cvvEncryption.iv,
      })

      if (!cvvEncryptionResult.success || !cvvEncryptionResult.encryptedData) {
        return {
          success: false,
          error: "Failed to encrypt CVV",
        }
      }

      updatePayload.cvvEncryptionId = cvvEncryptionResult.encryptedData.id
    }

    // Handle number encryption update if provided
    if (validatedUpdateData.numberEncryption) {
      const numberEncryptionResult = await createEncryptedData({
        encryptedValue: validatedUpdateData.numberEncryption.encryptedValue,
        encryptionKey: validatedUpdateData.numberEncryption.encryptionKey,
        iv: validatedUpdateData.numberEncryption.iv,
      })

      if (
        !numberEncryptionResult.success ||
        !numberEncryptionResult.encryptedData
      ) {
        return {
          success: false,
          error: "Failed to encrypt card number",
        }
      }

      updatePayload.numberEncryptionId = numberEncryptionResult.encryptedData.id
    }

    // Add other fields
    Object.assign(updatePayload, {
      name: validatedUpdateData.name,
      description: validatedUpdateData.description,
      type: validatedUpdateData.type,
      provider: validatedUpdateData.provider,
      status: validatedUpdateData.status,
      billingAddress: validatedUpdateData.billingAddress,
      cardholderName: validatedUpdateData.cardholderName,
      cardholderEmail: validatedUpdateData.cardholderEmail,
      ...getOrReturnEmptyObject(validatedUpdateData.containerId, "containerId"),
      updatedAt: new Date(),
    })

    const updatedCard = await database.card.update({
      where: { id },
      data: updatePayload,
    })

    return {
      success: true,
      card: CardEntity.getSimpleRo(updatedCard),
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
      }
    }

    console.error("Card update error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Delete a card
 */
export async function deleteCard(data: DeleteCardDto): Promise<{
  success: boolean
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedData = deleteCardDtoSchema.parse(data)

    // Use getSimpleCardById to check if card exists and belongs to user
    const existingCardResult = await getSimpleCardById(validatedData.id)
    if (!existingCardResult.success) {
      return {
        success: false,
        error: existingCardResult.error,
      }
    }

    await database.card.delete({
      where: {
        id: validatedData.id,
        userId: session.user.id,
      },
    })

    return {
      success: true,
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
      }
    }

    console.error("Card deletion error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * List cards with pagination
 */
export async function listCards(
  page = 1,
  limit = 10,
  containerId?: string
): Promise<{
  success: boolean
  cards?: CardSimpleRo[]
  total?: number
  error?: string
}> {
  try {
    const session = await verifySession()
    const skip = (page - 1) * limit

    const whereClause: Prisma.CardWhereInput = {
      userId: session.user.id,
      ...(containerId && { containerId }),
    }

    const [cards, total] = await Promise.all([
      database.card.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      database.card.count({ where: whereClause }),
    ])

    return {
      success: true,
      cards: cards.map((card) => CardEntity.getSimpleRo(card)),
      total,
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("List cards error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Create a card with metadata
 */
export async function createCardWithMetadata(
  cardData: CardDto,
  metadataData?: Omit<CardMetadataDto, "cardId">
): Promise<{
  success: boolean
  card?: CardSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    // First create the card
    const cardResult = await createCard(cardData)

    if (!cardResult.success || !cardResult.card) {
      return cardResult
    }

    // If metadata is provided, create it
    if (metadataData) {
      const metadataResult = await createCardMetadata({
        ...metadataData,
        cardId: cardResult.card.id,
      })

      if (!metadataResult.success) {
        // If metadata creation fails, we should probably delete the card
        // But for now, we'll just return the card without metadata
        console.warn(
          "Card created but metadata creation failed:",
          metadataResult.error
        )
      }
    }

    return cardResult
  } catch (error) {
    console.error("Create card with metadata error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
