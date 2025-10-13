import { authMiddleware } from "@/middleware/auth"
import { database } from "@/prisma/client"
import {
  getEncryptedDataCountOutputSchema,
  getUserCountOutputSchema,
  type GetEncryptedDataCountOutput,
  type GetUserCountOutput,
} from "@/schemas/user/statistics"
import { currentUserDtoSchema, type CurrentUserDto } from "@/schemas/user/user"
import {
  getWaitlistCountOutputSchema,
  joinWaitlistInputSchema,
  joinWaitlistOutputSchema,
  type GetWaitlistCountOutput,
  type JoinWaitlistInput,
  type JoinWaitlistOutput,
} from "@/schemas/user/waitlist"
import {
  subscribeToRoadmapInputSchema,
  subscribeToRoadmapOutputSchema,
  type SubscribeToRoadmapInput,
  type SubscribeToRoadmapOutput,
} from "@/schemas/user/roadmap"
import { ORPCError, os } from "@orpc/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"

import { createDefaultContainers } from "@/lib/utils/default-containers"
import {
  sendWaitlistEmail,
  sendRoadmapSubscriptionEmail,
} from "@/lib/email"

import type { ORPCContext } from "../types"

const baseProcedure = os.$context<ORPCContext>()
const publicProcedure = baseProcedure.use(({ context, next }) => {
  return next({ context })
})

const authProcedure = baseProcedure.use(({ context, next }) =>
  authMiddleware({ context, next })
)

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

      // Get the user's position in the waitlist
      const position = await database.waitlist.count({
        where: {
          createdAt: {
            lte: new Date(), // Count all entries including the one we just created
          },
        },
      })

      // Send waitlist email
      try {
        await sendWaitlistEmail({
          to: input.email,
          waitlistPosition: position,
        })
      } catch (emailError) {
        console.error("Failed to send waitlist email:", emailError)
        // Don't fail the request if email fails
      }

      return { success: true, position }
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

// Get current user profile with plan information
export const getCurrentUser = authProcedure
  .input(z.object({}))
  .output(currentUserDtoSchema)
  .handler(async ({ context }): Promise<CurrentUserDto> => {
    const user = await database.user.findUnique({
      where: { id: context.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        image: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new ORPCError("NOT_FOUND")
    }

    return user
  })

// Subscribe to roadmap updates
export const subscribeToRoadmap = publicProcedure
  .input(subscribeToRoadmapInputSchema)
  .output(subscribeToRoadmapOutputSchema)
  .handler(async ({ input }): Promise<SubscribeToRoadmapOutput> => {
    try {
      // Check if email already exists in roadmap subscriptions
      const existingSubscription =
        await database.roadmapSubscription.findUnique({
          where: { email: input.email },
        })

      if (existingSubscription) {
        return {
          success: false,
          error: "Email is already subscribed",
        }
      }

      // Add to roadmap subscriptions
      await database.roadmapSubscription.create({
        data: {
          email: input.email,
        },
      })

      // Send subscription confirmation email
      try {
        await sendRoadmapSubscriptionEmail({
          to: input.email,
        })
      } catch (emailError) {
        console.error("Failed to send subscription email:", emailError)
        // Don't fail the request if email fails
      }

      return { success: true }
    } catch (error) {
      // Re-throw ORPC errors to let ORPC handle them
      if (error instanceof ORPCError) {
        throw error
      }

      // Handle Prisma-specific errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error("Database constraint error subscribing to roadmap:", {
          code: error.code,
          message: error.message,
          meta: error.meta,
        })

        // Handle unique constraint violations
        if (error.code === "P2002") {
          return {
            success: false,
            error: "Email is already subscribed",
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
        console.error("Unknown Prisma error subscribing to roadmap:", {
          message: error.message,
        })
        return {
          success: false,
          error: "Database connection issue occurred",
        }
      }

      // Handle Prisma validation errors
      if (error instanceof Prisma.PrismaClientValidationError) {
        console.error("Prisma validation error subscribing to roadmap:", {
          message: error.message,
        })
        return {
          success: false,
          error: "Invalid data provided",
        }
      }

      // Handle unexpected errors
      console.error("Unexpected error subscribing to roadmap:", error)
      return {
        success: false,
        error: "An unexpected error occurred. Please try again later.",
      }
    }
  })

// Initialize default containers for a user
export const initializeDefaultContainers = authProcedure
  .input(z.object({}))
  .output(z.object({ success: z.boolean(), message: z.string() }))
  .handler(async ({ context }) => {
    try {
      // Check if user already has all default containers
      const existingDefaultContainers = await database.container.findMany({
        where: {
          userId: context.user.id,
          isDefault: true,
        },
      })

      const expectedDefaultCount = 3
      if (existingDefaultContainers.length >= expectedDefaultCount) {
        return {
          success: false,
          message: "Default containers already exist for this user",
        }
      }

      // Create default containers
      await createDefaultContainers(context.user.id)

      return {
        success: true,
        message: "Default containers created successfully",
      }
    } catch (error) {
      console.error("Error creating default containers:", error)
      throw new ORPCError("INTERNAL_SERVER_ERROR")
    }
  })

// Export the user router
export const userRouter = {
  joinWaitlist,
  getWaitlistCount,
  getUserCount,
  getEncryptedDataCount,
  getCurrentUser,
  subscribeToRoadmap,
  initializeDefaultContainers,
}
