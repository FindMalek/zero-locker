import { encryptedDataDtoSchema } from "@/schemas/encryption/encryption"
import { secretOutputSchema } from "@/schemas/secrets/dto"
import { z } from "zod"

import { containerOutputSchema, createContainerInputSchema } from "./dto"

// Schema for creating a container with secrets
export const createContainerWithSecretsInputSchema = z.object({
  container: createContainerInputSchema,
  secrets: z.array(
    z.object({
      name: z.string().min(1, "Secret name is required"),
      note: z.string().optional(),
      valueEncryption: encryptedDataDtoSchema,
    })
  ),
})

export const createContainerWithSecretsOutputSchema = z.object({
  success: z.boolean(),
  container: containerOutputSchema.optional(),
  secrets: z.array(secretOutputSchema).optional(),
  error: z.string().optional(),
})

export type CreateContainerWithSecretsInput = z.infer<
  typeof createContainerWithSecretsInputSchema
>
export type CreateContainerWithSecretsOutput = z.infer<
  typeof createContainerWithSecretsOutputSchema
>
