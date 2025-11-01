import { UserPlan } from "@prisma/client"
import { z } from "zod"

// ============================================================================
// User Plan Enum
// ============================================================================

export const userPlanSchema = z.enum([UserPlan.NORMAL, UserPlan.PRO])

export const userPlanEnum = userPlanSchema.enum
export const LIST_USER_PLANS = Object.values(userPlanEnum)
export type UserPlanInfer = z.infer<typeof userPlanSchema>
