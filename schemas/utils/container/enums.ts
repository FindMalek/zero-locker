import { ContainerType } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// Container Type Enum
// ============================================================================

export const containerTypeSchema = z.nativeEnum(ContainerType)

export const containerTypeEnum = containerTypeSchema.enum
export const LIST_CONTAINER_TYPES = Object.values(containerTypeEnum)
export type ContainerTypeInfer = z.infer<typeof containerTypeSchema>

