import { ContainerType, PrismaClient } from "@prisma/client"

async function seedContainers(prisma: PrismaClient) {
  console.log("🌱 Seeding containers...")

  const users = await prisma.user.findMany()
  const containersData = []

  for (const user of users) {
    // Personal container - mixed type (default)
    containersData.push({
      id: `container_personal_${user.id}`,
      name: "Personal",
      icon: "🏠",
      description: "Personal accounts and credentials",
      type: ContainerType.MIXED,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user.id,
    })

    // Work container - mixed type for both credentials and secrets
    containersData.push({
      id: `container_work_${user.id}`,
      name: "Work",
      icon: "💼",
      description: "Work-related accounts and credentials",
      type: ContainerType.MIXED,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user.id,
    })

    // Finance container - for cards only
    containersData.push({
      id: `container_finance_${user.id}`,
      name: "Finance",
      icon: "💰",
      description: "Financial accounts and payment information",
      type: ContainerType.CARDS_ONLY,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user.id,
    })

    // Environment secrets container - for secrets only (enables env operations)
    containersData.push({
      id: `container_env_${user.id}`,
      name: "Environment Variables",
      icon: "🔧",
      description: "Environment variables and API keys for development",
      type: ContainerType.SECRETS_ONLY,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user.id,
    })
  }

  await prisma.container.createMany({
    data: containersData,
  })

  console.log("✅ Containers seeded successfully")
}

export { seedContainers }
