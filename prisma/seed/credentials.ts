import { AccountStatus, Prisma, PrismaClient } from "@prisma/client"

import { saltAndHashPassword } from "../../lib/auth/password"
import { encryptDataSync, SEED_ENCRYPTION_CONFIG } from "../../lib/encryption"

async function seedCredentials(prisma: PrismaClient) {
  console.log("🌱 Seeding credentials...")

  const users = await prisma.user.findMany()
  const platforms = await prisma.platform.findMany()
  const containers = await prisma.container.findMany()
  const tags = await prisma.tag.findMany()

  // Get the platform IDs
  const googlePlatform = platforms.find((p) => p.name === "Google")
  const githubPlatform = platforms.find((p) => p.name === "GitHub")
  const awsPlatform = platforms.find((p) => p.name === "AWS")
  const microsoftPlatform = platforms.find((p) => p.name === "Microsoft")

  // Ensure platforms are found
  if (
    !googlePlatform ||
    !githubPlatform ||
    !awsPlatform ||
    !microsoftPlatform
  ) {
    console.error("❌ Required platforms not found")
    return
  }

  // Prepare arrays for bulk insertion
  const encryptedDataToCreate: Prisma.EncryptedDataCreateManyInput[] = []
  const credentialsToCreate: Prisma.CredentialCreateManyInput[] = []
  const credentialTagConnections: { credentialId: string; tagIds: string[] }[] =
    []
  const metadataData: Prisma.CredentialMetadataCreateManyInput[] = []

  // Hash passwords in parallel to speed up seeding
  const googlePasswordPromise = saltAndHashPassword("GooglePass123!")
  const githubPasswordPromise = saltAndHashPassword("GitHubPass123!")
  const awsPasswordPromise = saltAndHashPassword("AWSPass123!")

  // Wait for all password hashes to complete
  const [googlePassword, githubPassword, awsPassword] = await Promise.all([
    googlePasswordPromise,
    githubPasswordPromise,
    awsPasswordPromise,
  ])

  for (const user of users) {
    // Find the user's default containers
    const accountsContainer = containers.find(
      (c) =>
        c.userId === user.id && c.name === "Accounts" && c.isDefault === true
    )
    const workContainer = containers.find(
      (c) => c.userId === user.id && c.name === "Work"
    )

    // Find user's tags
    const importantTag = tags.find(
      (t) => t.userId === user.id && t.name === "Important"
    )
    const personalTag = tags.find(
      (t) => t.userId === user.id && t.name === "Personal"
    )
    const workTag = tags.find((t) => t.userId === user.id && t.name === "Work")

    // Prepare credential IDs
    const googleCredId = `credential_google_${user.id}`
    const githubCredId = `credential_github_${user.id}`
    const awsCredId = `credential_aws_${user.id}`

    // Prepare encrypted data IDs
    const googlePasswordEncId = `enc_google_pass_${user.id}`
    const githubPasswordEncId = `enc_github_pass_${user.id}`
    const awsPasswordEncId = `enc_aws_pass_${user.id}`

    // Prepare encrypted data for Google password
    const googlePasswordEncrypted = await encryptDataSync(
      googlePassword,
      SEED_ENCRYPTION_CONFIG.MASTER_KEY,
      SEED_ENCRYPTION_CONFIG.CREDENTIAL_PASSWORD_IV
    )
    encryptedDataToCreate.push({
      id: googlePasswordEncId,
      encryptedValue: googlePasswordEncrypted,
      encryptionKey: SEED_ENCRYPTION_CONFIG.MASTER_KEY,
      iv: SEED_ENCRYPTION_CONFIG.CREDENTIAL_PASSWORD_IV,
    })

    // Prepare Google credential - goes to default Accounts container
    credentialsToCreate.push({
      id: googleCredId,
      identifier: user.email,
      passwordEncryptionId: googlePasswordEncId,
      status: AccountStatus.ACTIVE,
      description: "Google account",
      lastViewed: new Date(),
      updatedAt: new Date(),
      createdAt: new Date(),
      platformId: googlePlatform.id,
      userId: user.id,
      containerId: accountsContainer?.id,
    })

    // Store tag connections for Google credential
    if (personalTag && importantTag) {
      credentialTagConnections.push({
        credentialId: googleCredId,
        tagIds: [personalTag.id, importantTag.id],
      })
    }

    // Prepare encrypted data for GitHub password
    const githubPasswordEncrypted = await encryptDataSync(
      githubPassword,
      SEED_ENCRYPTION_CONFIG.MASTER_KEY,
      SEED_ENCRYPTION_CONFIG.CREDENTIAL_PASSWORD_IV
    )
    encryptedDataToCreate.push({
      id: githubPasswordEncId,
      encryptedValue: githubPasswordEncrypted,
      encryptionKey: SEED_ENCRYPTION_CONFIG.MASTER_KEY,
      iv: SEED_ENCRYPTION_CONFIG.CREDENTIAL_PASSWORD_IV,
    })

    // Prepare GitHub credential - goes to default Accounts container
    credentialsToCreate.push({
      id: githubCredId,
      identifier: `${user.name.replace(" ", "").toLowerCase()}`,
      passwordEncryptionId: githubPasswordEncId,
      status: AccountStatus.ACTIVE,
      description: "GitHub account",
      lastViewed: new Date(),
      updatedAt: new Date(),
      createdAt: new Date(),
      platformId: githubPlatform.id,
      userId: user.id,
      containerId: accountsContainer?.id,
    })

    // Store tag connections for GitHub credential
    if (workTag) {
      credentialTagConnections.push({
        credentialId: githubCredId,
        tagIds: [workTag.id],
      })
    }

    // Store metadata for GitHub credential
    metadataData.push({
      id: `metadata_github_${user.id}`,
      recoveryEmail: user.email,
      has2FA: true,
      credentialId: githubCredId,
    })

    // AWS credential - goes to default Accounts container
    if (accountsContainer) {
      // Prepare encrypted data for AWS password
      const awsPasswordEncrypted = await encryptDataSync(
        awsPassword,
        SEED_ENCRYPTION_CONFIG.MASTER_KEY,
        SEED_ENCRYPTION_CONFIG.CREDENTIAL_PASSWORD_IV
      )
      encryptedDataToCreate.push({
        id: awsPasswordEncId,
        encryptedValue: awsPasswordEncrypted,
        encryptionKey: SEED_ENCRYPTION_CONFIG.MASTER_KEY,
        iv: SEED_ENCRYPTION_CONFIG.CREDENTIAL_PASSWORD_IV,
      })

      // Prepare AWS credential
      credentialsToCreate.push({
        id: awsCredId,
        identifier: `${user.name.replace(" ", ".").toLowerCase()}@company.com`,
        passwordEncryptionId: awsPasswordEncId,
        status: AccountStatus.ACTIVE,
        description: "AWS account",
        updatedAt: new Date(),
        createdAt: new Date(),
        platformId: awsPlatform.id,
        userId: user.id,
        containerId: accountsContainer.id,
      })

      // Store tag connections for AWS credential
      if (workTag) {
        credentialTagConnections.push({
          credentialId: awsCredId,
          tagIds: [workTag.id],
        })
      }
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

    // Then create all credentials
    if (credentialsToCreate.length > 0) {
      await tx.credential.createMany({
        data: credentialsToCreate,
      })
    }

    // Bulk create all metadata
    if (metadataData.length > 0) {
      await tx.credentialMetadata.createMany({
        data: metadataData,
      })
    }
  })

  // Connect credentials to tags
  // We need to do this separately as createMany doesn't support relations
  for (const connection of credentialTagConnections) {
    await prisma.credential.update({
      where: { id: connection.credentialId },
      data: {
        tags: {
          connect: connection.tagIds.map((id) => ({ id })),
        },
      },
    })
  }

  console.log("✅ Credentials seeded successfully")
}

export { seedCredentials }
