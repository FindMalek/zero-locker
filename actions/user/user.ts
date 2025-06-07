"use server"

import { database } from "@/prisma/client"
import {
  deleteUserDtoSchema,
  getUserByIdDtoSchema,
  listUsersDtoSchema,
  updateUserDtoSchema,
  type DeleteUserDto,
  type GetUserByIdDto,
  type ListUsersDto,
  type UpdateUserDto,
} from "@/schemas"
import { Prisma } from "@prisma/client"
import { z } from "zod"

import { UserDto, UserRo, type UserDto as UserDtoType } from "@/config/schema"
import { verifySession } from "@/lib/auth/verify"

/**
 * Get user by ID (Simple RO)
 */
export async function getSimpleUserById(id: string): Promise<{
  success: boolean
  user?: z.infer<typeof UserRo>
  error?: string
}> {
  try {
    const user = await database.user.findUnique({
      where: { id },
    })

    if (!user) {
      return {
        success: false,
        error: "User not found",
      }
    }

    return {
      success: true,
      user: UserRo.parse(user),
    }
  } catch (error) {
    console.error("Get simple user error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get user by ID (Full RO with relations)
 */
export async function getUserById(data: GetUserByIdDto): Promise<{
  success: boolean
  user?: z.infer<typeof UserRo>
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const validatedData = getUserByIdDtoSchema.parse(data)

    const user = await database.user.findUnique({
      where: { id: validatedData.id },
      include: {
        tags: true,
        cards: true,
        secrets: true,
        platforms: true,
        containers: true,
        credentials: true,
        credentialHistories: true,
      },
    })

    if (!user) {
      return {
        success: false,
        error: "User not found",
      }
    }

    return {
      success: true,
      user: UserRo.parse(user),
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
      }
    }

    console.error("Get user error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<{
  success: boolean
  user?: z.infer<typeof UserRo>
  error?: string
}> {
  try {
    const session = await verifySession()

    const result = await getSimpleUserById(session.user.id)
    return result
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Get current user error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Create a new user
 */
export async function createUser(data: UserDtoType): Promise<{
  success: boolean
  user?: z.infer<typeof UserRo>
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const validatedData = UserDto.parse(data)

    try {
      const user = await database.user.create({
        data: {
          id: crypto.randomUUID(),
          ...validatedData,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        user: UserRo.parse(user),
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return {
          success: false,
          error: "A user with this email already exists",
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

    console.error("User creation error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Update a user
 */
export async function updateUser(data: UpdateUserDto): Promise<{
  success: boolean
  user?: z.infer<typeof UserRo>
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const validatedData = updateUserDtoSchema.parse(data)
    const { id, ...updateData } = validatedData

    // Use getSimpleUserById to check if user exists
    const existingUserResult = await getSimpleUserById(id)
    if (!existingUserResult.success) {
      return existingUserResult
    }

    try {
      const updatedUser = await database.user.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        user: UserRo.parse(updatedUser),
      }
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return {
          success: false,
          error: "A user with this email already exists",
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

    console.error("User update error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Delete a user
 */
export async function deleteUser(data: DeleteUserDto): Promise<{
  success: boolean
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const validatedData = deleteUserDtoSchema.parse(data)

    // Use getSimpleUserById to check if user exists
    const existingUserResult = await getSimpleUserById(validatedData.id)
    if (!existingUserResult.success) {
      return {
        success: false,
        error: existingUserResult.error,
      }
    }

    await database.user.delete({
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

    console.error("User deletion error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * List users with pagination
 */
export async function listUsers(
  data: ListUsersDto = { page: 1, limit: 10 }
): Promise<{
  success: boolean
  users?: z.infer<typeof UserRo>[]
  total?: number
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const validatedData = listUsersDtoSchema.parse(data)
    const { page, limit } = validatedData
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      database.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      database.user.count(),
    ])

    return {
      success: true,
      users: users.map((user) => UserRo.parse(user)),
      total,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
      }
    }

    console.error("List users error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
