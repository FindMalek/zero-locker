import {
  CardProvider,
  CardStatus,
  CardType,
  Prisma,
  PrismaClient,
} from "@prisma/client"

import { encryptDataSync, SEED_ENCRYPTION_CONFIG } from "../../lib/encryption"

async function seedCards(prisma: PrismaClient) {
  console.log("🌱 Seeding cards...")

  const users = await prisma.user.findMany()
  const containers = await prisma.container.findMany()

  // Prepare all data for batch operations
  const encryptedDataToCreate: Prisma.EncryptedDataCreateManyInput[] = []
  const cardsToCreate: Prisma.CardCreateManyInput[] = []

  for (const user of users) {
    // Find the default Cards container for each user
    const cardsContainer = containers.find(
      (c) => c.userId === user.id && c.name === "Cards" && c.isDefault === true
    )

    if (cardsContainer) {
      // Prepare encrypted data for Visa card
      const visaCvvId = `enc_visa_cvv_${user.id}`
      const visaNumberId = `enc_visa_number_${user.id}`

      // Encrypt Visa data
      const visaCvvEncrypted = await encryptDataSync(
        "123",
        SEED_ENCRYPTION_CONFIG.MASTER_KEY,
        SEED_ENCRYPTION_CONFIG.CARD_CVV_IV
      )
      const visaNumberEncrypted = await encryptDataSync(
        "4111111111111111",
        SEED_ENCRYPTION_CONFIG.MASTER_KEY,
        SEED_ENCRYPTION_CONFIG.CARD_NUMBER_IV
      )

      encryptedDataToCreate.push(
        {
          id: visaCvvId,
          encryptedValue: visaCvvEncrypted,
          encryptionKey: SEED_ENCRYPTION_CONFIG.MASTER_KEY,
          iv: SEED_ENCRYPTION_CONFIG.CARD_CVV_IV,
        },
        {
          id: visaNumberId,
          encryptedValue: visaNumberEncrypted,
          encryptionKey: SEED_ENCRYPTION_CONFIG.MASTER_KEY,
          iv: SEED_ENCRYPTION_CONFIG.CARD_NUMBER_IV,
        }
      )

      // Prepare encrypted data for Mastercard
      const mcCvvId = `enc_mc_cvv_${user.id}`
      const mcNumberId = `enc_mc_number_${user.id}`

      // Encrypt Mastercard data
      const mcCvvEncrypted = await encryptDataSync(
        "321",
        SEED_ENCRYPTION_CONFIG.MASTER_KEY,
        SEED_ENCRYPTION_CONFIG.CARD_CVV_IV
      )
      const mcNumberEncrypted = await encryptDataSync(
        "5555555555554444",
        SEED_ENCRYPTION_CONFIG.MASTER_KEY,
        SEED_ENCRYPTION_CONFIG.CARD_NUMBER_IV
      )

      encryptedDataToCreate.push(
        {
          id: mcCvvId,
          encryptedValue: mcCvvEncrypted,
          encryptionKey: SEED_ENCRYPTION_CONFIG.MASTER_KEY,
          iv: SEED_ENCRYPTION_CONFIG.CARD_CVV_IV,
        },
        {
          id: mcNumberId,
          encryptedValue: mcNumberEncrypted,
          encryptionKey: SEED_ENCRYPTION_CONFIG.MASTER_KEY,
          iv: SEED_ENCRYPTION_CONFIG.CARD_NUMBER_IV,
        }
      )

      // Prepare cards data
      cardsToCreate.push(
        {
          id: `card_visa_${user.id}`,
          name: "Primary Visa Card",
          description: "Personal Visa credit card",
          type: CardType.CREDIT,
          provider: CardProvider.VISA,
          status: CardStatus.ACTIVE,
          expiryDate: new Date("2025-12-31"),
          billingAddress: "123 Main St, Anytown, USA",
          cardholderName: user.name,
          cardholderEmail: user.email,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: user.id,
          containerId: cardsContainer.id,
          cvvEncryptionId: visaCvvId,
          numberEncryptionId: visaNumberId,
        },
        {
          id: `card_mc_${user.id}`,
          name: "Mastercard",
          description: "Secondary Mastercard",
          type: CardType.CREDIT,
          provider: CardProvider.MASTERCARD,
          status: CardStatus.ACTIVE,
          expiryDate: new Date("2024-10-31"),
          billingAddress: "123 Main St, Anytown, USA",
          cardholderName: user.name,
          cardholderEmail: user.email,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: user.id,
          containerId: cardsContainer.id,
          cvvEncryptionId: mcCvvId,
          numberEncryptionId: mcNumberId,
        }
      )
    }
  }

  // Use a transaction to batch all operations
  await prisma.$transaction(async (tx) => {
    // Create all encrypted data first
    if (encryptedDataToCreate.length > 0) {
      await tx.encryptedData.createMany({
        data: encryptedDataToCreate,
      })
    }

    // Then create all cards
    if (cardsToCreate.length > 0) {
      await tx.card.createMany({
        data: cardsToCreate,
      })
    }
  })

  console.log("✅ Cards seeded successfully")
}

export { seedCards }
