"use server"

import { database } from "@/prisma/client"
import {
  EncryptedDataDto,
  EncryptedDataSimpleRo,
} from "@/schemas/encrypted-data"
import { z } from "zod"

import { verifySession } from "@/lib/auth/verify"

/**
 * Create encrypted data
 */
export async function createEncryptedData(data: EncryptedDataDto): Promise<{
  success: boolean
  encryptedData?: EncryptedDataSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    await verifySession()

    const encryptedData = await database.encryptedData.create({
      data: {
        encryptedValue: data.encryptedValue,
        encryptionKey: data.encryptionKey,
        iv: data.iv,
      },
    })

    return {
      success: true,
      encryptedData: {
        id: encryptedData.id,
        encryptedValue: encryptedData.encryptedValue,
        encryptionKey: encryptedData.encryptionKey,
        iv: encryptedData.iv,
        createdAt: encryptedData.createdAt,
        updatedAt: encryptedData.updatedAt,
      },
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Encrypted data creation error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Update encrypted data
 */
export async function updateEncryptedData(
  id: string,
  data: EncryptedDataDto
): Promise<{
  success: boolean
  encryptedData?: EncryptedDataSimpleRo
  error?: string
}> {
  try {
    await verifySession()

    const encryptedData = await database.encryptedData.update({
      where: { id },
      data: {
        encryptedValue: data.encryptedValue,
        encryptionKey: data.encryptionKey,
        iv: data.iv,
      },
    })

    return {
      success: true,
      encryptedData: {
        id: encryptedData.id,
        encryptedValue: encryptedData.encryptedValue,
        encryptionKey: encryptedData.encryptionKey,
        iv: encryptedData.iv,
        createdAt: encryptedData.createdAt,
        updatedAt: encryptedData.updatedAt,
      },
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Encrypted data update error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
