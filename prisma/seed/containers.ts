import { ContainerType, PrismaClient, UserPlan } from "@prisma/client"

async function seedContainers(prisma: PrismaClient) {
  console.log("🌱 Seeding containers...")
  
  // Default containers are created automatically during user creation
  // For Pro users, create additional containers to showcase the unlimited feature
  
  const proUsers = await prisma.user.findMany({
    where: { plan: UserPlan.PRO }
  })
  
  const additionalContainersData = []
  
  for (const user of proUsers) {
    // Personal container - mixed type 
    additionalContainersData.push({
      id: `container_personal_${user.id}`,
      name: "Personal",
      icon: "🏠",
      description: "Personal accounts and credentials",
      type: ContainerType.MIXED,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user.id,
    })

    // Work container - mixed type
    additionalContainersData.push({
      id: `container_work_${user.id}`,
      name: "Work",
      icon: "💼",
      description: "Work-related accounts and credentials",
      type: ContainerType.MIXED,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user.id,
    })

    // Finance container - mixed type for broader usage
    additionalContainersData.push({
      id: `container_finance_${user.id}`,
      name: "Finance",
      icon: "💰",
      description: "Financial accounts and payment information",
      type: ContainerType.MIXED,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user.id,
    })
  }

  if (additionalContainersData.length > 0) {
    await prisma.container.createMany({
      data: additionalContainersData,
    })
    console.log(`✅ Created ${additionalContainersData.length} additional containers for Pro users`)
  }
  
  console.log("✅ Containers seeded successfully")
}

export { seedContainers }
