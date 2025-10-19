import { CardEntity } from "@/entities/card/card"
import { authMiddleware } from "@/middleware/auth"
import { database } from "@/prisma/client"
import {
  cardOutputSchema,
  createCardInputSchema,
  deleteCardInputSchema,
  getCardInputSchema,
  listCardsInputSchema,
  listCardsOutputSchema,
  updateCardInputSchema,
  type CardOutput,
  type ListCardsOutput,
} from "@/schemas/card"
import { ORPCError, os } from "@orpc/server"
import type { Prisma } from "@prisma/client"

import { getOrReturnEmptyObject } from "@/lib/utils"
import { CardExpiryDateUtils } from "@/lib/utils/card-expiry-helpers"
import { createEncryptedData } from "@/lib/utils/encryption-helpers"
import { createTagsAndGetConnections } from "@/lib/utils/tag-helpers"

import type { ORPCContext } from "../types"

const baseProcedure = os.$context<ORPCContext>()
const authProcedure = baseProcedure.use(({ context, next }) =>
  authMiddleware({ context, next })
)

// Get card by ID
export const getCard = authProcedure
  .input(getCardInputSchema)
  .output(cardOutputSchema)
  .handler(async ({ input, context }): Promise<CardOutput> => {
    const card = await database.card.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
      },
    })

    if (!card) {
      throw new ORPCError("NOT_FOUND")
    }

    return CardEntity.getSimpleRo(card)
  })

// List cards with pagination
export const listCards = authProcedure
  .input(listCardsInputSchema)
  .output(listCardsOutputSchema)
  .handler(async ({ input, context }): Promise<ListCardsOutput> => {
    const { page, limit, search, containerId } = input
    const skip = (page - 1) * limit

    const where = {
      userId: context.user.id,
      ...(containerId && { containerId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
          {
            cardholderName: { contains: search, mode: "insensitive" as const },
          },
        ],
      }),
    }

    const [cards, total] = await Promise.all([
      database.card.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      database.card.count({ where }),
    ])

    return {
      cards: cards.map((card) => CardEntity.getSimpleRo(card)),
      total,
      hasMore: skip + cards.length < total,
      page,
      limit,
    }
  })

// Create card
export const createCard = authProcedure
  .input(createCardInputSchema)
  .output(cardOutputSchema)
  .handler(async ({ input, context }): Promise<CardOutput> => {
    // Handle expiry date using shared utility
    const expiryDate = CardExpiryDateUtils.processServerExpiryDate(
      input.expiryDate
    )

    const card = await database.$transaction(async (tx) => {
      const tagConnections = await createTagsAndGetConnections(
        input.tags,
        context.user.id,
        input.containerId,
        tx
      )

      const cvvEncryptionResult = await createEncryptedData(
        {
          encryptedValue: input.cvvEncryption.encryptedValue,
          encryptionKey: input.cvvEncryption.encryptionKey,
          iv: input.cvvEncryption.iv,
        },
        tx
      )

      if (!cvvEncryptionResult.success || !cvvEncryptionResult.encryptedData) {
        throw new ORPCError("INTERNAL_SERVER_ERROR")
      }

      const numberEncryptionResult = await createEncryptedData(
        {
          encryptedValue: input.numberEncryption.encryptedValue,
          encryptionKey: input.numberEncryption.encryptionKey,
          iv: input.numberEncryption.iv,
        },
        tx
      )

      if (
        !numberEncryptionResult.success ||
        !numberEncryptionResult.encryptedData
      ) {
        throw new ORPCError("INTERNAL_SERVER_ERROR")
      }

      return await tx.card.create({
        data: {
          name: input.name,
          description: input.description,
          type: input.type,
          provider: input.provider,
          status: input.status,
          expiryDate,
          billingAddress: input.billingAddress,
          cardholderName: input.cardholderName,
          cardholderEmail: input.cardholderEmail,
          userId: context.user.id,
          tags: tagConnections,
          cvvEncryptionId: cvvEncryptionResult.encryptedData.id,
          numberEncryptionId: numberEncryptionResult.encryptedData.id,
          ...getOrReturnEmptyObject(input.containerId, "containerId"),
        },
      })
    })

    return CardEntity.getSimpleRo(card)
  })

// Update card
export const updateCard = authProcedure
  .input(updateCardInputSchema)
  .output(cardOutputSchema)
  .handler(async ({ input, context }): Promise<CardOutput> => {
    const { id, ...updateData } = input

    // Verify card ownership
    const existingCard = await database.card.findFirst({
      where: {
        id,
        userId: context.user.id,
      },
    })

    if (!existingCard) {
      throw new ORPCError("NOT_FOUND")
    }

    // Process the update data
    const updatePayload: Prisma.CardUpdateInput = {}

    if (updateData.name !== undefined) updatePayload.name = updateData.name
    if (updateData.description !== undefined)
      updatePayload.description = updateData.description
    if (updateData.type !== undefined) updatePayload.type = updateData.type
    if (updateData.provider !== undefined)
      updatePayload.provider = updateData.provider
    if (updateData.status !== undefined)
      updatePayload.status = updateData.status
    if (updateData.cardholderName !== undefined)
      updatePayload.cardholderName = updateData.cardholderName
    if (updateData.billingAddress !== undefined)
      updatePayload.billingAddress = updateData.billingAddress
    if (updateData.cardholderEmail !== undefined)
      updatePayload.cardholderEmail = updateData.cardholderEmail
    if (updateData.containerId !== undefined)
      updatePayload.container = updateData.containerId
        ? { connect: { id: updateData.containerId } }
        : { disconnect: true }

    // Handle expiry date if provided
    if (updateData.expiryDate !== undefined) {
      updatePayload.expiryDate = CardExpiryDateUtils.processServerExpiryDate(
        updateData.expiryDate
      )
    }

    // Handle tags if provided
    if (updateData.tags !== undefined) {
      const tagConnections = await createTagsAndGetConnections(
        updateData.tags,
        context.user.id,
        updateData.containerId || existingCard.containerId || undefined
      )
      updatePayload.tags = tagConnections
    }

    // Handle encryption updates if provided
    if (updateData.cvvEncryption) {
      const cvvEncryptionResult = await createEncryptedData({
        encryptedValue: updateData.cvvEncryption.encryptedValue,
        encryptionKey: updateData.cvvEncryption.encryptionKey,
        iv: updateData.cvvEncryption.iv,
      })

      if (!cvvEncryptionResult.success || !cvvEncryptionResult.encryptedData) {
        throw new ORPCError("INTERNAL_SERVER_ERROR")
      }

      updatePayload.cvvEncryption = {
        connect: { id: cvvEncryptionResult.encryptedData.id },
      }
    }

    if (updateData.numberEncryption) {
      const numberEncryptionResult = await createEncryptedData({
        encryptedValue: updateData.numberEncryption.encryptedValue,
        encryptionKey: updateData.numberEncryption.encryptionKey,
        iv: updateData.numberEncryption.iv,
      })

      if (
        !numberEncryptionResult.success ||
        !numberEncryptionResult.encryptedData
      ) {
        throw new ORPCError("INTERNAL_SERVER_ERROR")
      }

      updatePayload.numberEncryption = {
        connect: { id: numberEncryptionResult.encryptedData.id },
      }
    }

    const updatedCard = await database.card.update({
      where: { id },
      data: updatePayload,
    })

    return CardEntity.getSimpleRo(updatedCard)
  })

// Delete card
export const deleteCard = authProcedure
  .input(deleteCardInputSchema)
  .output(cardOutputSchema)
  .handler(async ({ input, context }): Promise<CardOutput> => {
    // Verify card ownership
    const existingCard = await database.card.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
      },
    })

    if (!existingCard) {
      throw new ORPCError("NOT_FOUND")
    }

    const deletedCard = await database.card.delete({
      where: { id: input.id },
    })

    return CardEntity.getSimpleRo(deletedCard)
  })

// Export the card router
export const cardRouter = {
  get: getCard,
  list: listCards,
  create: createCard,
  update: updateCard,
  delete: deleteCard,
}
