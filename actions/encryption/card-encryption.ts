"use server"

import { EncryptedDataEntity } from "@/entities/encryption/encryption"
import { database } from "@/prisma/client"
import { EncryptedDataSimpleRo } from "@/schemas/encryption"

import { verifySession } from "@/lib/auth/verify"

/**
 * Get CVV encrypted data for a card
 */
export async function getCardCvvEncryption(cardId: string): Promise<{
  success: boolean
  encryptedData?: EncryptedDataSimpleRo
  error?: string
}> {
  try {
    const session = await verifySession()

    // First verify the card belongs to the user
    const card = await database.card.findFirst({
      where: {
        id: cardId,
        userId: session.user.id,
      },
      select: {
        cvvEncryptionId: true,
      },
    })

    if (!card) {
      return {
        success: false,
        error: "Card not found or not authorized",
      }
    }

    // Get the encrypted CVV data
    const encryptedData = await database.encryptedData.findUnique({
      where: {
        id: card.cvvEncryptionId,
      },
    })

    if (!encryptedData) {
      return {
        success: false,
        error: "CVV encryption data not found",
      }
    }

    return {
      success: true,
      encryptedData: EncryptedDataEntity.getSimpleRo(encryptedData),
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }

    console.error("Get card CVV encryption error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get number encrypted data for a card
 */
export async function getCardNumberEncryption(cardId: string): Promise<{
  success: boolean
  encryptedData?: EncryptedDataSimpleRo
  error?: string
}> {
  try {
    const session = await verifySession()

    // First verify the card belongs to the user
    const card = await database.card.findFirst({
      where: {
        id: cardId,
        userId: session.user.id,
      },
      select: {
        numberEncryptionId: true,
      },
    })

    if (!card) {
      return {
        success: false,
        error: "Card not found or not authorized",
      }
    }

    // Get the encrypted number data
    const encryptedData = await database.encryptedData.findUnique({
      where: {
        id: card.numberEncryptionId,
      },
    })

    if (!encryptedData) {
      return {
        success: false,
        error: "Number encryption data not found",
      }
    }

    return {
      success: true,
      encryptedData: EncryptedDataEntity.getSimpleRo(encryptedData),
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }

    console.error("Get card number encryption error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
