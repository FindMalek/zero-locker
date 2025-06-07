"use server"

import { CardMetadataEntity } from "@/entities/card/card-metadata"
import { database } from "@/prisma/client"
import {
  cardMetadataDtoSchema,
  deleteCardMetadataDtoSchema,
  getCardMetadataDtoSchema,
  listCardMetadataDtoSchema,
  updateCardMetadataDtoSchema,
  type CardMetadataDto,
  type CardMetadataSimpleRo,
  type DeleteCardMetadataDto,
  type GetCardMetadataDto,
  type ListCardMetadataDto,
  type UpdateCardMetadataDto,
} from "@/schemas/card/card-metadata"
import { z } from "zod"

import { verifySession } from "@/lib/auth/verify"

/**
 * Create card metadata
 */
export async function createCardMetadata(data: CardMetadataDto): Promise<{
  success: boolean
  metadata?: CardMetadataSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedData = cardMetadataDtoSchema.parse(data)

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
      metadata: CardMetadataEntity.getSimpleRo(metadata),
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
export async function getCardMetadata(data: GetCardMetadataDto): Promise<{
  success: boolean
  metadata?: CardMetadataSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedData = getCardMetadataDtoSchema.parse(data)

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

    // Get metadata
    const metadata = await database.cardMetadata.findFirst({
      where: { cardId: validatedData.cardId },
    })

    if (!metadata) {
      return {
        success: false,
        error: "Metadata not found for this card",
      }
    }

    return {
      success: true,
      metadata: CardMetadataEntity.getSimpleRo(metadata),
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
export async function updateCardMetadata(data: UpdateCardMetadataDto): Promise<{
  success: boolean
  metadata?: CardMetadataSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedData = updateCardMetadataDtoSchema.parse(data)

    // Get metadata
    const existingMetadata = await database.cardMetadata.findUnique({
      where: { id: validatedData.id },
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

    // Update metadata
    const updatedMetadata = await database.cardMetadata.update({
      where: { id: validatedData.id },
      data: validatedData.data,
    })

    return {
      success: true,
      metadata: CardMetadataEntity.getSimpleRo(updatedMetadata),
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
export async function deleteCardMetadata(data: DeleteCardMetadataDto): Promise<{
  success: boolean
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedData = deleteCardMetadataDtoSchema.parse(data)

    // Get metadata
    const existingMetadata = await database.cardMetadata.findUnique({
      where: { id: validatedData.id },
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
      where: { id: validatedData.id },
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
    console.error("Delete card metadata error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * List card metadata by card ID
 */
export async function listCardMetadata(data: ListCardMetadataDto): Promise<{
  success: boolean
  metadata?: CardMetadataSimpleRo[]
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedData = listCardMetadataDtoSchema.parse(data)

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

    // Get all metadata for this card
    const metadata = await database.cardMetadata.findMany({
      where: { cardId: validatedData.cardId },
    })

    return {
      success: true,
      metadata: metadata.map((item) => CardMetadataEntity.getSimpleRo(item)),
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
    console.error("List card metadata error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
