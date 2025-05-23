import { PlatformStatus, PrismaClient } from "@prisma/client"

async function seedPlatforms(prisma: PrismaClient) {
  console.log("🌱 Seeding platforms...")

  const platforms = [
    {
      id: "platform_1",
      name: "Google",
      logo: "https://www.google.com/favicon.ico",
      loginUrl: "https://accounts.google.com",
      status: PlatformStatus.APPROVED,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "platform_2",
      name: "GitHub",
      logo: "https://github.com/favicon.ico",
      loginUrl: "https://github.com/login",
      status: PlatformStatus.APPROVED,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "platform_3",
      name: "AWS",
      logo: "https://aws.amazon.com/favicon.ico",
      loginUrl: "https://console.aws.amazon.com",
      status: PlatformStatus.APPROVED,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "platform_4",
      name: "Microsoft",
      logo: "https://www.microsoft.com/favicon.ico",
      loginUrl: "https://account.microsoft.com",
      status: PlatformStatus.APPROVED,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  await prisma.platform.createMany({
    data: platforms,
  })

  console.log("✅ Platforms seeded successfully")
}

export { seedPlatforms }
