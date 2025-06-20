import { database } from "@/prisma/client"
import type { EncryptedDataDto } from "@/schemas/encryption/encryption"

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
