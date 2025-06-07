import {
  CardProvider,
  CardStatus,
  CardType,
  PrismaClient,
} from "@prisma/client"

async function seedCards(prisma: PrismaClient) {
  console.log("🌱 Seeding cards...")

  const users = await prisma.user.findMany()
  const containers = await prisma.container.findMany()

  for (const user of users) {
    // Find the finance container for each user
    const financeContainer = containers.find(
      (c) => c.userId === user.id && c.name === "Finance"
    )

    if (financeContainer) {
      // Create encrypted data for Visa card
      const visaCvvEncryption = await prisma.encryptedData.create({
        data: {
          encryptedValue: "123",
          encryptionKey: "mock_encryption_key_for_development",
          iv: "mock_iv_for_development",
        },
      })

      const visaNumberEncryption = await prisma.encryptedData.create({
        data: {
          encryptedValue: "4111111111111111",
          encryptionKey: "mock_encryption_key_for_development",
          iv: "mock_iv_for_development",
        },
      })

      // Visa credit card
      await prisma.card.create({
        data: {
          id: `card_visa_${user.id}`,
          name: "Primary Visa Card",
          description: "Personal Visa credit card",
          type: CardType.CREDIT,
          provider: CardProvider.VISA,
          status: CardStatus.ACTIVE,
          number: "4111111111111111",
          expiryDate: new Date("2025-12-31"),
          billingAddress: "123 Main St, Anytown, USA",
          cardholderName: user.name,
          cardholderEmail: user.email,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: user.id,
          containerId: financeContainer.id,
          cvvEncryptionId: visaCvvEncryption.id,
          numberEncryptionId: visaNumberEncryption.id,
        },
      })

      // Create encrypted data for Mastercard
      const mcCvvEncryption = await prisma.encryptedData.create({
        data: {
          encryptedValue: "321",
          encryptionKey: "mock_encryption_key_for_development",
          iv: "mock_iv_for_development",
        },
      })

      const mcNumberEncryption = await prisma.encryptedData.create({
        data: {
          encryptedValue: "5555555555554444",
          encryptionKey: "mock_encryption_key_for_development",
          iv: "mock_iv_for_development",
        },
      })

      // Mastercard
      await prisma.card.create({
        data: {
          id: `card_mc_${user.id}`,
          name: "Mastercard",
          description: "Secondary Mastercard",
          type: CardType.CREDIT,
          provider: CardProvider.MASTERCARD,
          status: CardStatus.ACTIVE,
          number: "5555555555554444",
          expiryDate: new Date("2024-10-31"),
          billingAddress: "123 Main St, Anytown, USA",
          cardholderName: user.name,
          cardholderEmail: user.email,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: user.id,
          containerId: financeContainer.id,
          cvvEncryptionId: mcCvvEncryption.id,
          numberEncryptionId: mcNumberEncryption.id,
        },
      })
    }
  }

  console.log("✅ Cards seeded successfully")
}

export { seedCards }
