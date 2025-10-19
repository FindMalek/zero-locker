import { PlatformStatus } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// Platform Status Enum
// ============================================================================

export const platformStatusSchema = z.nativeEnum(PlatformStatus)

export const platformStatusEnum = platformStatusSchema.enum
export const LIST_PLATFORM_STATUSES = Object.values(platformStatusEnum)
export type PlatformStatusInfer = z.infer<typeof platformStatusSchema>

