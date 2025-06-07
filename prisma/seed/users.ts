import { PrismaClient } from "@prisma/client"

import { saltAndHashPassword } from "../../lib/auth/password"

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
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  // Create users and their accounts
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
  }

  console.log("✅ Users seeded successfully")
}

export { seedUsers }
