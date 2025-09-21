import type { EncryptedDataDto } from "@/schemas/encryption/encryption"
import { getDatabaseClient, type DatabaseClient, type PrismaTransactionClient } from "@/prisma/client"

// Function overloads for better API
export async function createEncryptedData(data: EncryptedDataDto): Promise<{
  success: boolean
  encryptedData?: { id: string }
  error?: string
}>
export async function createEncryptedData(
  data: EncryptedDataDto,
  tx: PrismaTransactionClient
): Promise<{
  success: boolean
  encryptedData?: { id: string }
  error?: string
}>
export async function createEncryptedData(
  data: EncryptedDataDto,
  tx?: PrismaTransactionClient
): Promise<{
  success: boolean
  encryptedData?: { id: string }
  error?: string
}> {
  const client = getDatabaseClient(tx)
  
  try {
    const encryptedData = await client.encryptedData.create({
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
