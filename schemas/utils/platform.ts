import { PlatformStatus } from "@prisma/client"
import { z } from "zod"

export const platformDtoSchema = z.object({
  name: z.string().min(1, "Name is required"),

  logo: z.string().optional(),
  loginUrl: z.string().optional(),

  status: z
    .nativeEnum(PlatformStatus)
    .optional()
    .default(PlatformStatus.PENDING),
})

export type PlatformDto = z.infer<typeof platformDtoSchema>

export const platformSimpleRoSchema = z.object({
  id: z.string(),

  name: z.string(),

  status: z.nativeEnum(PlatformStatus),

  logo: z.string().nullable(),
  loginUrl: z.string().nullable(),

  updatedAt: z.date(),
  createdAt: z.date(),

  userId: z.string().nullable(),
})

export type PlatformSimpleRo = z.infer<typeof platformSimpleRoSchema>
