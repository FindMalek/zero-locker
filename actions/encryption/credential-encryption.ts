"use server"

import { EncryptedDataEntity } from "@/entities/encryption/encryption"
import { database } from "@/prisma/client"
import { EncryptedDataSimpleRo } from "@/schemas/encryption"

import { verifySession } from "@/lib/auth/verify"

/**
 * Get password encrypted data for a credential
 */
export async function getCredentialPasswordEncryption(
  credentialId: string
): Promise<{
  success: boolean
  encryptedData?: EncryptedDataSimpleRo
  error?: string
}> {
  try {
    const session = await verifySession()

    // First verify the credential belongs to the user
    const credential = await database.credential.findFirst({
      where: {
        id: credentialId,
        userId: session.user.id,
      },
      select: {
        passwordEncryptionId: true,
      },
    })

    if (!credential) {
      return {
        success: false,
        error: "Credential not found or not authorized",
      }
    }

    // Get the encrypted password data
    const encryptedData = await database.encryptedData.findUnique({
      where: {
        id: credential.passwordEncryptionId,
      },
    })

    if (!encryptedData) {
      return {
        success: false,
        error: "Password encryption data not found",
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

    console.error("Get credential password encryption error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
