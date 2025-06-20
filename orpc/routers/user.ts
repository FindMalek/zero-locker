import { database } from "@/prisma/client"
import {
  getEncryptedDataCountOutputSchema,
  getUserCountOutputSchema,
  type GetEncryptedDataCountOutput,
  type GetUserCountOutput,
} from "@/schemas/user/statistics"
import {
  getWaitlistCountOutputSchema,
  joinWaitlistInputSchema,
  joinWaitlistOutputSchema,
  type GetWaitlistCountOutput,
  type JoinWaitlistInput,
  type JoinWaitlistOutput,
} from "@/schemas/user/waitlist"
import { ORPCError, os } from "@orpc/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"

import type { ORPCContext } from "../types"

const baseProcedure = os.$context<ORPCContext>()
const publicProcedure = baseProcedure.use(({ context, next }) => {
  return next({ context })
})

// Join waitlist
export const joinWaitlist = publicProcedure
  .input(joinWaitlistInputSchema)
  .output(joinWaitlistOutputSchema)
  .handler(async ({ input }): Promise<JoinWaitlistOutput> => {
    try {
      // Check if email already exists in waitlist
      const existingWaitlistEntry = await database.waitlist.findUnique({
        where: { email: input.email },
      })

      if (existingWaitlistEntry) {
        return {
          success: false,
          error: "Email is already on the waitlist",
        }
      }

      // Add to waitlist
      await database.waitlist.create({
        data: {
          email: input.email,
        },
      })

      return { success: true }
    } catch (error) {
      // Re-throw ORPC errors to let ORPC handle them
      if (error instanceof ORPCError) {
        throw error
      }

      // Handle Prisma-specific errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error("Database constraint error joining waitlist:", {
          code: error.code,
          message: error.message,
          meta: error.meta,
        })

        // Handle unique constraint violations
        if (error.code === "P2002") {
          return {
            success: false,
            error: "Email is already on the waitlist",
          }
        }

        // Handle other known Prisma errors
        return {
          success: false,
          error: "Database constraint violation occurred",
        }
      }

      // Handle Prisma client errors (connection issues, etc.)
      if (error instanceof Prisma.PrismaClientUnknownRequestError) {
        console.error("Unknown Prisma error joining waitlist:", {
          message: error.message,
        })
        return {
          success: false,
          error: "Database connection issue occurred",
        }
      }

      // Handle Prisma validation errors
      if (error instanceof Prisma.PrismaClientValidationError) {
        console.error("Prisma validation error joining waitlist:", {
          message: error.message,
        })
        return {
          success: false,
          error: "Invalid data provided",
        }
      }

      // Handle unexpected errors
      console.error("Unexpected error joining waitlist:", error)
      return {
        success: false,
        error: "An unexpected error occurred. Please try again later.",
      }
    }
  })

// Get waitlist count
export const getWaitlistCount = publicProcedure
  .input(z.object({}))
  .output(getWaitlistCountOutputSchema)
  .handler(async (): Promise<GetWaitlistCountOutput> => {
    const total = await database.waitlist.count()
    return { total }
  })

// Get user count
export const getUserCount = publicProcedure
  .input(z.object({}))
  .output(getUserCountOutputSchema)
  .handler(async (): Promise<GetUserCountOutput> => {
    const total = await database.user.count()
    return { total }
  })

// Get encrypted data count
export const getEncryptedDataCount = publicProcedure
  .input(z.object({}))
  .output(getEncryptedDataCountOutputSchema)
  .handler(async (): Promise<GetEncryptedDataCountOutput> => {
    const count = await database.encryptedData.count()
    return { count }
  })

// Export the user router
export const userRouter = {
  joinWaitlist,
  getWaitlistCount,
  getUserCount,
  getEncryptedDataCount,
}
