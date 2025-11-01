import { PrismaClient } from "@prisma/client"

import { seedCards } from "./cards"
import { seedContainers } from "./containers"
import { seedCredentials } from "./credentials"
import { seedPayments } from "./payments"
import { seedPlatforms } from "./platforms"
import { seedSecrets } from "./secrets"
import { seedTags } from "./tags"
import { seedUsers } from "./users"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seeding...")

  // Add all seeder functions here in the correct order
  await seedUsers(prisma)
  await seedPlatforms(prisma)
  await seedContainers(prisma)
  await seedTags(prisma)
  await seedCredentials(prisma)
  await seedCards(prisma)
  await seedSecrets(prisma)
  await seedPayments(prisma)

  console.log("✅ Database seeding completed")
}

main()
  .catch((e) => {
    console.error("❌ Database seeding failed")
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
