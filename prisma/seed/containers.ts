import { ContainerType, PrismaClient, UserPlan } from "@prisma/client"

async function seedContainers(prisma: PrismaClient) {
  console.log("🌱 Seeding additional containers...")

  // Get Pro users who can have additional custom containers
  const proUsers = await prisma.user.findMany({
    where: { plan: UserPlan.PRO },
  })

  const additionalContainersData = []

  for (const user of proUsers) {
    // Pro users get additional custom containers to showcase the Pro features

    // Work container - mixed type for work-related items
    additionalContainersData.push({
      id: `container_work_${user.id}`,
      name: "Work",
      icon: "💼",
      description: "Work-related accounts and credentials",
      type: ContainerType.MIXED,
      isDefault: false, // Custom container, not default
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user.id,
    })

    // Finance container - mixed type for personal finance
    additionalContainersData.push({
      id: `container_finance_${user.id}`,
      name: "Finance",
      icon: "💰",
      description: "Personal finance and banking information",
      type: ContainerType.MIXED,
      isDefault: false, // Custom container, not default
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user.id,
    })
  }

  if (additionalContainersData.length > 0) {
    await prisma.container.createMany({
      data: additionalContainersData,
    })
    console.log(
      `✅ Created ${additionalContainersData.length} additional containers for Pro users`
    )
  }

  console.log("✅ Additional containers seeded successfully")
}

export { seedContainers }
