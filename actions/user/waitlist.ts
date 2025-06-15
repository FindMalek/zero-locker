"use server"

import { database } from "@/prisma/client"
import { Prisma } from "@prisma/client"
import { z } from "zod"

import {
  WaitlistUserDtoSchema,
  WaitlistUserRo,
  type WaitlistUserDto,
} from "@/config/schema"

const getWaitlistByIdDtoSchema = z.object({
  id: z.string().min(1, "Waitlist ID is required"),
})

const updateWaitlistDtoSchema = WaitlistUserDtoSchema.partial().extend({
  id: z.string().min(1, "Waitlist ID is required"),
})

const deleteWaitlistDtoSchema = z.object({
  id: z.string().min(1, "Waitlist ID is required"),
})

type GetWaitlistByIdDto = z.infer<typeof getWaitlistByIdDtoSchema>
type UpdateWaitlistDto = z.infer<typeof updateWaitlistDtoSchema>
type DeleteWaitlistDto = z.infer<typeof deleteWaitlistDtoSchema>

/**
 * Get waitlist entry by ID (Simple RO)
 */
export async function getSimpleWaitlistById(id: string): Promise<{
  success: boolean
  waitlist?: z.infer<typeof WaitlistUserRo>
  error?: string
}> {
  try {
    const waitlist = await database.waitlist.findUnique({
      where: { id },
    })

    if (!waitlist) {
      return {
        success: false,
        error: "Waitlist entry not found",
      }
    }

    return {
      success: true,
      waitlist: WaitlistUserRo.parse(waitlist),
    }
  } catch (error) {
    console.error("Get simple waitlist error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get waitlist entry by ID (Full RO)
 */
export async function getWaitlistById(data: GetWaitlistByIdDto): Promise<{
  success: boolean
  waitlist?: z.infer<typeof WaitlistUserRo>
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const validatedData = getWaitlistByIdDtoSchema.parse(data)

    const result = await getSimpleWaitlistById(validatedData.id)
    return result
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
      }
    }

    console.error("Get waitlist error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Join waitlist server action
 */
export async function joinWaitlist(data: WaitlistUserDto): Promise<{
  success: boolean
  waitlist?: z.infer<typeof WaitlistUserRo>
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const validatedData = WaitlistUserDtoSchema.parse(data)

    try {
      const waitlist = await database.waitlist.create({
        data: {
          email: validatedData.email,
        },
      })

      return {
        success: true,
        waitlist: WaitlistUserRo.parse(waitlist),
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return {
          success: false,
          error: "This email is already on our waitlist",
        }
      }
      throw error
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
      }
    }

    console.error("Waitlist submission error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Update a waitlist entry
 */
export async function updateWaitlist(data: UpdateWaitlistDto): Promise<{
  success: boolean
  waitlist?: z.infer<typeof WaitlistUserRo>
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const validatedData = updateWaitlistDtoSchema.parse(data)
    const { id, ...updateData } = validatedData

    // Use getSimpleWaitlistById to check if waitlist entry exists
    const existingWaitlistResult = await getSimpleWaitlistById(id)
    if (!existingWaitlistResult.success) {
      return existingWaitlistResult
    }

    try {
      const updatedWaitlist = await database.waitlist.update({
        where: { id },
        data: updateData,
      })

      return {
        success: true,
        waitlist: WaitlistUserRo.parse(updatedWaitlist),
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return {
          success: false,
          error: "This email is already on our waitlist",
        }
      }
      throw error
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
      }
    }

    console.error("Waitlist update error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Delete a waitlist entry
 */
export async function deleteWaitlist(data: DeleteWaitlistDto): Promise<{
  success: boolean
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const validatedData = deleteWaitlistDtoSchema.parse(data)

    // Use getSimpleWaitlistById to check if waitlist entry exists
    const existingWaitlistResult = await getSimpleWaitlistById(validatedData.id)
    if (!existingWaitlistResult.success) {
      return {
        success: false,
        error: existingWaitlistResult.error,
      }
    }

    await database.waitlist.delete({
      where: { id: validatedData.id },
    })

    return {
      success: true,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
      }
    }

    console.error("Waitlist deletion error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * List waitlist entries with pagination
 */
export async function listWaitlist(
  page = 1,
  limit = 10
): Promise<{
  success: boolean
  waitlist?: z.infer<typeof WaitlistUserRo>[]
  total?: number
  error?: string
}> {
  try {
    const skip = (page - 1) * limit

    const [waitlist, total] = await Promise.all([
      database.waitlist.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      database.waitlist.count(),
    ])

    return {
      success: true,
      waitlist: waitlist.map((entry) => WaitlistUserRo.parse(entry)),
      total,
    }
  } catch (error) {
    console.error("List waitlist error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
