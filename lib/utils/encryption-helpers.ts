import { database } from "@/prisma/client"
import type { EncryptedDataDto } from "@/schemas/encryption/encryption"

/**
 * Creates a new encrypted data record in the database using the provided initialization vector, encrypted value, and encryption key.
 *
 * @param data - The encrypted data details to store
 * @returns An object indicating success and the new record's ID if successful, or an error message if the operation fails
 */
export async function createEncryptedData(data: EncryptedDataDto): Promise<{
  success: boolean
  encryptedData?: { id: string }
  error?: string
}> {
  try {
    const encryptedData = await database.encryptedData.create({
      data: {
        iv: data.iv,
        encryptedValue: data.encryptedValue,
        encryptionKey: data.encryptionKey,
      },
    })

    return {
      success: true,
      encryptedData: { id: encryptedData.id },
    }
  } catch (error) {
    console.error("Error creating encrypted data:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
