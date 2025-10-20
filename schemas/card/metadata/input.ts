import { z } from "zod"

// ============================================================================
// Card Metadata Input Schemas
// ============================================================================

export const inputSchema = z.object({
  creditLimit: z.number().optional(),
  availableCredit: z.number().optional(),
  interestRate: z.number().optional(),
  annualFee: z.number().optional(),
  rewardsProgram: z.string().optional(),
  contactlessEnabled: z.boolean().default(false),
  onlinePaymentsEnabled: z.boolean().default(true),
  internationalPaymentsEnabled: z.boolean().default(true),
  pinSet: z.boolean().default(false),
  otherInfo: z.array(z.any()).optional(),
  cardId: z.string(),
})

export type Input = z.infer<typeof inputSchema>

// ============================================================================
// CRUD Operation Input Schemas
// ============================================================================

// Get by Card ID
export const getInputSchema = z.object({
  cardId: z.string().min(1, "Card ID is required"),
})

export type GetInput = z.infer<typeof getInputSchema>

// Update
export const updateInputSchema = z.object({
  id: z.string().min(1, "Metadata ID is required"),
  data: inputSchema.partial(),
})

export type UpdateInput = z.infer<typeof updateInputSchema>

// Delete
export const deleteInputSchema = z.object({
  id: z.string().min(1, "Metadata ID is required"),
})

export type DeleteInput = z.infer<typeof deleteInputSchema>

// List
export const listInputSchema = z.object({
  cardId: z.string().min(1, "Card ID is required"),
})

export type ListInput = z.infer<typeof listInputSchema>
