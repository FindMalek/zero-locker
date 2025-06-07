"use server"

import { database } from "@/prisma/client"
import {
  EncryptedDataDto,
  EncryptedDataSimpleRo,
} from "@/schemas/encryption/encryption"
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

/**
 * Get encrypted data by ID
 */
export async function getEncryptedDataById(id: string): Promise<{
  success: boolean
  encryptedData?: EncryptedDataSimpleRo
  error?: string
}> {
  try {
    await verifySession()

    const encryptedData = await database.encryptedData.findUnique({
      where: { id },
    })

    if (!encryptedData) {
      return {
        success: false,
        error: "Encrypted data not found",
      }
    }

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
    console.error("Get encrypted data error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Delete encrypted data
 */
export async function deleteEncryptedData(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    await verifySession()

    const existingData = await database.encryptedData.findUnique({
      where: { id },
    })

    if (!existingData) {
      return {
        success: false,
        error: "Encrypted data not found",
      }
    }

    await database.encryptedData.delete({
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
    console.error("Delete encrypted data error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
