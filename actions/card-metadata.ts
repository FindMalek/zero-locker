"use server"

import { database } from "@/prisma/client"
import { CardMetadataDto } from "@/schemas/card/card-metadata"
import { z } from "zod"

import { verifySession } from "@/lib/auth/verify"

/**
 * Create card metadata
 */
export async function createCardMetadata(data: CardMetadataDto): Promise<{
  success: boolean
  metadata?: any
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedData = CardMetadataDto.parse(data)

    // Check if card exists and belongs to the user
    const card = await database.card.findFirst({
      where: {
        id: validatedData.cardId,
        userId: session.user.id,
      },
    })

    if (!card) {
      return {
        success: false,
        error: "Card not found",
      }
    }

    // Check if metadata already exists for this card
    const existingMetadata = await database.cardMetadata.findFirst({
      where: { cardId: validatedData.cardId },
    })

    if (existingMetadata) {
      return {
        success: false,
        error: "Metadata already exists for this card",
      }
    }

    // Create metadata
    const metadata = await database.cardMetadata.create({
      data: validatedData,
    })

    return {
      success: true,
      metadata,
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

    console.error("Card metadata creation error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get card metadata
 */
export async function getCardMetadata(cardId: string): Promise<{
  success: boolean
  metadata?: any
  error?: string
}> {
  try {
    const session = await verifySession()

    // Check if card exists and belongs to the user
    const card = await database.card.findFirst({
      where: {
        id: cardId,
        userId: session.user.id,
      },
    })

    if (!card) {
      return {
        success: false,
        error: "Card not found",
      }
    }

    // Get metadata
    const metadata = await database.cardMetadata.findFirst({
      where: { cardId },
    })

    if (!metadata) {
      return {
        success: false,
        error: "Metadata not found for this card",
      }
    }

    return {
      success: true,
      metadata,
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Get card metadata error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Update card metadata
 */
export async function updateCardMetadata(
  id: string,
  data: Partial<CardMetadataDto>
): Promise<{
  success: boolean
  metadata?: any
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()

    // Get metadata
    const existingMetadata = await database.cardMetadata.findUnique({
      where: { id },
      include: { card: true },
    })

    if (!existingMetadata) {
      return {
        success: false,
        error: "Metadata not found",
      }
    }

    // Check if card belongs to the user
    if (existingMetadata.card.userId !== session.user.id) {
      return {
        success: false,
        error: "Not authorized",
      }
    }

    // Validate data
    const partialSchema = CardMetadataDto.partial()
    const validatedData = partialSchema.parse(data)

    // Update metadata
    const updatedMetadata = await database.cardMetadata.update({
      where: { id },
      data: validatedData,
    })

    return {
      success: true,
      metadata: updatedMetadata,
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

    console.error("Card metadata update error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Delete card metadata
 */
export async function deleteCardMetadata(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const session = await verifySession()

    // Get metadata
    const existingMetadata = await database.cardMetadata.findUnique({
      where: { id },
      include: { card: true },
    })

    if (!existingMetadata) {
      return {
        success: false,
        error: "Metadata not found",
      }
    }

    // Check if card belongs to the user
    if (existingMetadata.card.userId !== session.user.id) {
      return {
        success: false,
        error: "Not authorized",
      }
    }

    // Delete metadata
    await database.cardMetadata.delete({
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
    console.error("Delete card metadata error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
