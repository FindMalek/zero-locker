"use server"

import { CardEntity } from "@/entities/card"
import { database } from "@/prisma/client"
import {
  CardDtoSchema,
  CardSimpleRo,
  type CardDto as CardDtoType,
} from "@/schemas/card"
import { Prisma } from "@prisma/client"
import { z } from "zod"

import { verifySession } from "@/lib/auth/verify"
import { CardExpiryDateUtils } from "@/lib/card-expiry-utils"
import { getOrReturnEmptyObject } from "@/lib/utils"

import { CardMetadataDto } from "@/actions/card-metadata"
import { createTagsAndGetConnections } from "@/actions/tag"

/**
 * Create a new card
 */
export async function createCard(data: CardDtoType): Promise<{
  success: boolean
  card?: CardSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedData = CardDtoSchema.parse(data)

    // Handle expiry date using shared utility
    const expiryDate = CardExpiryDateUtils.processServerExpiryDate(
      validatedData.expiryDate
    )

    const tagConnections = await createTagsAndGetConnections(
      validatedData.tags,
      session.user.id,
      validatedData.containerId
    )

    const card = await database.card.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        notes: validatedData.notes,
        type: validatedData.type,
        provider: validatedData.provider,
        status: validatedData.status,
        number: validatedData.number,
        expiryDate,
        cvv: validatedData.cvv,
        encryptionKey: validatedData.encryptionKey || null,
        iv: validatedData.iv || null,
        billingAddress: validatedData.billingAddress,
        cardholderName: validatedData.cardholderName,
        cardholderEmail: validatedData.cardholderEmail,
        userId: session.user.id,
        tags: tagConnections,
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
 * Get card by ID
 */
export async function getCardById(id: string): Promise<{
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
    console.error("Get card error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Update a card
 */
export async function updateCard(
  id: string,
  data: Partial<CardDtoType>
): Promise<{
  success: boolean
  card?: CardSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()

    // Make sure card exists and belongs to user
    const existingCard = await database.card.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingCard) {
      return {
        success: false,
        error: "Card not found",
      }
    }

    // Validate using our DTO schema (partial)
    const partialCardSchema = CardDtoSchema.partial()
    const validatedData = partialCardSchema.parse(data)

    // Format expiry date if provided
    const updateData: any = { ...validatedData }
    if (validatedData.expiryDate) {
      updateData.expiryDate = CardExpiryDateUtils.processServerExpiryDate(
        validatedData.expiryDate
      )
    }

    try {
      // Update card with Prisma
      const updatedCard = await database.card.update({
        where: { id },
        data: updateData,
      })

      return {
        success: true,
        card: CardEntity.getSimpleRo(updatedCard),
      }
    } catch (error) {
      throw error
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
export async function deleteCard(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const session = await verifySession()

    // Make sure card exists and belongs to user
    const existingCard = await database.card.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingCard) {
      return {
        success: false,
        error: "Card not found",
      }
    }

    // Delete card with Prisma
    await database.card.delete({
      where: { id },
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
    console.error("Card deletion error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * List cards with optional filtering and pagination
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

    // Build filters
    const where: Prisma.CardWhereInput = {
      userId: session.user.id,
    }

    if (containerId) {
      where.containerId = containerId
    }

    const [cards, total] = await Promise.all([
      database.card.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      database.card.count({ where }),
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
 * Create a new card with optional metadata
 */
export async function createCardWithMetadata(
  cardData: CardDtoType,
  metadataData?: Omit<CardMetadataDto, "cardId">
): Promise<{
  success: boolean
  card?: CardSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedCardData = CardDtoSchema.parse(cardData)

    // Handle expiry date using shared utility
    const expiryDate = CardExpiryDateUtils.processServerExpiryDate(
      validatedCardData.expiryDate
    )

    const tagConnections = await createTagsAndGetConnections(
      validatedCardData.tags,
      session.user.id,
      validatedCardData.containerId
    )

    try {
      // Use a transaction to create both card and metadata
      const result = await database.$transaction(async (tx) => {
        const card = await tx.card.create({
          data: {
            name: validatedCardData.name,
            description: validatedCardData.description,
            notes: validatedCardData.notes,
            type: validatedCardData.type,
            provider: validatedCardData.provider,
            status: validatedCardData.status,
            number: validatedCardData.number,
            expiryDate,
            cvv: validatedCardData.cvv,
            encryptionKey: validatedCardData.encryptionKey || null,
            iv: validatedCardData.iv || null,
            billingAddress: validatedCardData.billingAddress,
            cardholderName: validatedCardData.cardholderName,
            cardholderEmail: validatedCardData.cardholderEmail,
            userId: session.user.id,
            tags: tagConnections,
            ...getOrReturnEmptyObject(
              validatedCardData.containerId,
              "containerId"
            ),
          },
        })

        // Create metadata if provided
        if (metadataData) {
          await tx.cardMetadata.create({
            data: {
              ...metadataData,
              cardId: card.id,
              otherInfo: metadataData.otherInfo || [],
            },
          })
        }

        return card
      })

      return {
        success: true,
        card: CardEntity.getSimpleRo(result),
      }
    } catch (error) {
      throw error
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
