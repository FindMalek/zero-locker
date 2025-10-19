import { AccountStatus } from "@prisma/client"
import { z } from "zod"

// Account Status Enum Schema
export const accountStatusSchema = z.enum([
  AccountStatus.ACTIVE,
  AccountStatus.SUSPENDED,
  AccountStatus.DELETED,
  AccountStatus.ARCHIVED,
])

export const accountStatusEnum = accountStatusSchema.enum
export const LIST_ACCOUNT_STATUSES = Object.values(accountStatusEnum)
export type AccountStatusInfer = z.infer<typeof accountStatusSchema>

