import { z } from "zod"

export const tagDtoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().optional(),
  containerId: z.string().optional(),
})

export type TagDto = z.infer<typeof tagDtoSchema>

export const tagSimpleRoSchema = z.object({
  id: z.string(),
  name: z.string(),

  color: z.string().nullable(),

  userId: z.string().nullable(),
  containerId: z.string().nullable(),
})

export type TagSimpleRo = z.infer<typeof tagSimpleRoSchema>
