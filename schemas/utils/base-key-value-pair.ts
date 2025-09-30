import { z } from "zod"

export const baseKeyValuePairSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(1, "Key is required"),
  value: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  encrypted: z.boolean().optional(),
  isEncrypting: z.boolean().optional(),
})

export type BaseKeyValuePair = z.infer<typeof baseKeyValuePairSchema>
