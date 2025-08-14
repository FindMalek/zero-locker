import { ContainerType, PrismaClient, UserPlan } from "@prisma/client"

import { saltAndHashPassword } from "../../lib/auth/password"

/**
 * Creates the 3 default containers for a new user in the seeder
 * This is a seeder-specific version to avoid server-only imports
 */
async function createDefaultContainersForSeeder(
  prisma: PrismaClient,
  userId: string
) {
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

  const createdContainers = await prisma.container.createMany({
    data: defaultContainers,
  })

  return createdContainers
}

async function seedUsers(prisma: PrismaClient) {
  console.log("🌱 Seeding users...")

  const users = [
    {
      id: "user_1",
      name: "John Doe",
      email: "john.doe@example.com",
      emailVerified: true,
      image: "https://avatar.vercel.sh/john.doe",
      password: "SecurePass123!",
      plan: UserPlan.NORMAL, // Normal user with default containers
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "user_2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      emailVerified: true,
      image: "https://avatar.vercel.sh/jane.smith",
      password: "SecurePass123!",
      plan: UserPlan.PRO, // Pro user with full container access
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "user_3",
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      emailVerified: true,
      image: "https://avatar.vercel.sh/mike.johnson",
      password: "SecurePass123!",
      plan: UserPlan.NORMAL, // Normal user with default containers
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  // Create users, accounts, and default containers
  for (const userData of users) {
    const { password, ...userWithoutPassword } = userData
    const hashedPassword = await saltAndHashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: userWithoutPassword,
    })

    // Create associated account with password
    await prisma.account.create({
      data: {
        id: `account_${user.id}`,
        accountId: user.email,
        providerId: "credential",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: user.id,
      },
    })

    // Create default containers for all users (both NORMAL and PRO)
    // This mimics the real app behavior where users get default containers on signup
    try {
      await createDefaultContainersForSeeder(prisma, user.id)
      console.log(
        `✅ Created default containers for ${user.name} (${user.plan})`
      )
    } catch (error) {
      console.error(
        `❌ Failed to create default containers for ${user.name}:`,
        error
      )
    }
  }

  console.log("✅ Users seeded successfully with default containers")
}

export { seedUsers }
