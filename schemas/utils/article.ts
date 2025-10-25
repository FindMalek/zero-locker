import { z } from "zod"

export const articleSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  author: z.string(),
  publishedAt: z.string(),
  image: z.string().optional(),
  href: z.string(),
})
