import { ContainerType } from "@prisma/client"
import { z } from "zod"

import { tagDtoSchema } from "./tag"

export const containerDtoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),

  description: z.string().optional(),

  type: z.nativeEnum(ContainerType).default(ContainerType.MIXED),
  tags: z.array(tagDtoSchema),
})

export type ContainerDto = z.infer<typeof containerDtoSchema>

export const containerSimpleRoSchema = z.object({
  id: z.string(),

  name: z.string(),
  icon: z.string(),

  description: z.string().nullable(),
  type: z.nativeEnum(ContainerType),

  updatedAt: z.date(),
  createdAt: z.date(),

  userId: z.string(),
})

export type ContainerSimpleRo = z.infer<typeof containerSimpleRoSchema>
