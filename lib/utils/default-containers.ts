import { database } from "@/prisma/client"
import { ContainerType } from "@prisma/client"

/**
 * Creates the 3 default containers for a new user
 * - Accounts (CREDENTIALS_ONLY)
 * - Cards (CARDS_ONLY)
 * - Environment Variables (SECRETS_ONLY)
 */
export async function createDefaultContainers(userId: string) {
  const defaultContainers = [
    {
      name: "Accounts",
      icon: "👤",
      description: "Default container for user accounts and credentials",
      type: ContainerType.CREDENTIALS_ONLY,
      isDefault: true,
      userId,
    },
    {
      name: "Cards",
      icon: "💳",
      description:
        "Default container for payment cards and financial information",
      type: ContainerType.CARDS_ONLY,
      isDefault: true,
      userId,
    },
    {
      name: "Environment Variables",
      icon: "🔧",
      description: "Default container for environment variables and API keys",
      type: ContainerType.SECRETS_ONLY,
      isDefault: true,
      userId,
    },
  ]

  try {
    const createdContainers = await database.container.createMany({
      data: defaultContainers,
    })

    console.log(
      `✅ Created ${createdContainers.count} default containers for user ${userId}`
    )
    return createdContainers
  } catch (error) {
    console.error(
      `❌ Failed to create default containers for user ${userId}:`,
      error
    )
    throw error
  }
}
