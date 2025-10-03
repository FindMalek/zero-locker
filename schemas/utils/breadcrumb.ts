import type { CardOutput } from "@/schemas/card/dto"
import type { CredentialOutput } from "@/schemas/credential/dto"
import type { SecretOutput } from "@/schemas/secrets/dto"
import type { PlatformSimpleRo } from "@/schemas/utils/platform"
import { z } from "zod"

// Breadcrumb item schemas for navigation components
export const BreadcrumbCredentialItemSchema = z.object({
  type: z.literal("credential"),
  data: z.object({
    credential: z.custom<CredentialOutput>(),
    platform: z.custom<PlatformSimpleRo>(),
  }),
})

export const BreadcrumbCardItemSchema = z.object({
  type: z.literal("card"),
  data: z.object({
    card: z.custom<CardOutput>(),
  }),
})

export const BreadcrumbSecretItemSchema = z.object({
  type: z.literal("secret"),
  data: z.object({
    secret: z.custom<SecretOutput>(),
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
