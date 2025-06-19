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
import { z } from "zod"

import type { ORPCContext } from "../types"

// Base procedure with context
const baseProcedure = os.$context<ORPCContext>()

// Public procedure (no auth required)
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
      console.error("Error joining waitlist:", error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
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
