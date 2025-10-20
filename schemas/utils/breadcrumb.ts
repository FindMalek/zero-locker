import { cardSimpleOutputSchema } from "@/schemas/card"
import { credentialSimpleOutputSchema } from "@/schemas/credential"
import { secretSimpleOutputSchema } from "@/schemas/secrets"
import { platformSimpleOutputSchema } from "@/schemas/utils"
import { z } from "zod"

// Breadcrumb item schemas for navigation components
export const BreadcrumbCredentialItemSchema = z.object({
  type: z.literal("credential"),
  data: z.object({
    credential: credentialSimpleOutputSchema,
    platform: platformSimpleOutputSchema,
  }),
})

export const BreadcrumbCardItemSchema = z.object({
  type: z.literal("card"),
  data: z.object({
    card: cardSimpleOutputSchema,
  }),
})

export const BreadcrumbSecretItemSchema = z.object({
  type: z.literal("secret"),
  data: z.object({
    secret: secretSimpleOutputSchema,
  }),
})

export const BreadcrumbItemSchema = z.discriminatedUnion("type", [
  BreadcrumbCredentialItemSchema,
  BreadcrumbCardItemSchema,
  BreadcrumbSecretItemSchema,
])

// Export types
export type BreadcrumbCredentialItem = z.infer<
  typeof BreadcrumbCredentialItemSchema
>
export type BreadcrumbCardItem = z.infer<typeof BreadcrumbCardItemSchema>
export type BreadcrumbSecretItem = z.infer<typeof BreadcrumbSecretItemSchema>
export type BreadcrumbItem = z.infer<typeof BreadcrumbItemSchema>
