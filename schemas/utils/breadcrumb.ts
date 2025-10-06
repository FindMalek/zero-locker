import { cardOutputSchema } from "@/schemas/card/dto"
import { credentialOutputSchema } from "@/schemas/credential/dto"
import { secretOutputSchema } from "@/schemas/secrets/dto"
import { platformSimpleRoSchema } from "@/schemas/utils/platform"
import { z } from "zod"

// Breadcrumb item schemas for navigation components
export const BreadcrumbCredentialItemSchema = z.object({
  type: z.literal("credential"),
  data: z.object({
    credential: credentialOutputSchema,
    platform: platformSimpleRoSchema,
  }),
})

export const BreadcrumbCardItemSchema = z.object({
  type: z.literal("card"),
  data: z.object({
    card: cardOutputSchema,
  }),
})

export const BreadcrumbSecretItemSchema = z.object({
  type: z.literal("secret"),
  data: z.object({
    secret: secretOutputSchema,
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
