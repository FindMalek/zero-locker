import { z } from "zod"

import {
  deleteSecretDtoSchema,
  getSecretByIdDtoSchema,
  secretDtoSchema,
  secretSimpleRoSchema,
  updateSecretDtoSchema,
} from "./secret"

// Input DTOs for oRPC procedures
export const createSecretInputSchema = secretDtoSchema
export const getSecretInputSchema = getSecretByIdDtoSchema
export const updateSecretInputSchema = updateSecretDtoSchema
export const deleteSecretInputSchema = deleteSecretDtoSchema

// List secrets with pagination
export const listSecretsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  containerId: z.string().optional(),
})

// Output DTOs for oRPC procedures
export const secretOutputSchema = secretSimpleRoSchema

export const listSecretsOutputSchema = z.object({
  secrets: z.array(secretOutputSchema),
  total: z.number().int(),
  hasMore: z.boolean(),
  page: z.number().int(),
  limit: z.number().int(),
})

// Export types
export type CreateSecretInput = z.infer<typeof createSecretInputSchema>
export type GetSecretInput = z.infer<typeof getSecretInputSchema>
export type UpdateSecretInput = z.infer<typeof updateSecretInputSchema>
export type DeleteSecretInput = z.infer<typeof deleteSecretInputSchema>
export type ListSecretsInput = z.infer<typeof listSecretsInputSchema>

export type SecretOutput = z.infer<typeof secretOutputSchema>
export type ListSecretsOutput = z.infer<typeof listSecretsOutputSchema>
