"use server"

import { EncryptedDataEntity } from "@/entities/encryption/encryption"
import { database } from "@/prisma/client"
import { EncryptedDataSimpleRo } from "@/schemas/encryption"

import { verifySession } from "@/lib/auth/verify"

/**
 * Get value encrypted data for a secret
 */
export async function getSecretValueEncryption(secretId: string): Promise<{
  success: boolean
  encryptedData?: EncryptedDataSimpleRo
  error?: string
}> {
  try {
    const session = await verifySession()

    // First verify the secret belongs to the user
    const secret = await database.secret.findFirst({
      where: {
        id: secretId,
        userId: session.user.id,
      },
      select: {
        valueEncryptionId: true,
      },
    })

    if (!secret) {
      return {
        success: false,
        error: "Secret not found or not authorized",
      }
    }

    // Get the encrypted value data
    const encryptedData = await database.encryptedData.findUnique({
      where: {
        id: secret.valueEncryptionId,
      },
    })

    if (!encryptedData) {
      return {
        success: false,
        error: "Value encryption data not found",
      }
    }

    // TODO: Update the 'lastViewed' field

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

    console.error("Get secret value encryption error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
