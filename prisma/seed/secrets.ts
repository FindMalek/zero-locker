import { Prisma, PrismaClient, SecretStatus, SecretType } from "@prisma/client"

import { encryptDataSync, SEED_ENCRYPTION_CONFIG } from "../../lib/encryption"

async function seedSecrets(prisma: PrismaClient) {
  console.log("🌱 Seeding secrets...")

  const users = await prisma.user.findMany()
  const containers = await prisma.container.findMany()

  // Prepare arrays for batch operations
  const secretsToCreate: Prisma.SecretCreateManyInput[] = []
  const metadataData: Prisma.SecretMetadataCreateManyInput[] = []
  const encryptedDataToCreate: Prisma.EncryptedDataCreateManyInput[] = []

  for (const user of users) {
    // Find the default Environment Variables container for each user
    const envContainer = containers.find(
      (c) =>
        c.userId === user.id &&
        c.name === "Environment Variables" &&
        c.isDefault === true
    )

    // Find the work container for additional secrets (Pro users only)
    const workContainer = containers.find(
      (c) => c.userId === user.id && c.name === "Work"
    )

    if (envContainer) {
      // Environment variables for development
      const secrets = [
        {
          id: `secret_db_url_${user.id}`,
          name: "DATABASE_URL",
          value: "postgresql://user:password@localhost:5432/mydb",
          note: "Connection string for local development database",
          metadataType: SecretType.DATABASE_URL,
        },
        {
          id: `secret_api_key_${user.id}`,
          name: "API_KEY",
          value: "sk-1234567890abcdef1234567890abcdef",
          note: "Main API key for external service",
          metadataType: SecretType.API_KEY,
        },
        {
          id: `secret_jwt_secret_${user.id}`,
          name: "JWT_SECRET",
          value: "super-secret-jwt-key-for-token-signing",
          note: "Secret key for JWT token signing",
          metadataType: SecretType.JWT_SECRET,
        },
        {
          id: `secret_redis_url_${user.id}`,
          name: "REDIS_URL",
          value: "redis://localhost:6379",
          note: "Redis connection URL for caching",
          metadataType: SecretType.DATABASE_URL,
        },
        {
          id: `secret_stripe_key_${user.id}`,
          name: "STRIPE_SECRET_KEY",
          value: "sk_test_1234567890abcdef1234567890abcdef",
          note: "Stripe secret key for payment processing",
          metadataType: SecretType.API_KEY,
        },
      ]

      for (const secret of secrets) {
        // Prepare encrypted data ID
        const valueEncryptionId = `enc_secret_${secret.id}`

        // Encrypt secret value
        const encryptedValue = await encryptDataSync(
          secret.value,
          SEED_ENCRYPTION_CONFIG.MASTER_KEY,
          SEED_ENCRYPTION_CONFIG.SECRET_VALUE_IV
        )

        // Prepare encrypted data for secret value
        encryptedDataToCreate.push({
          id: valueEncryptionId,
          encryptedValue: encryptedValue,
          encryptionKey: SEED_ENCRYPTION_CONFIG.MASTER_KEY,
          iv: SEED_ENCRYPTION_CONFIG.SECRET_VALUE_IV,
        })

        // Prepare secret data
        secretsToCreate.push({
          id: secret.id,
          name: secret.name,
          valueEncryptionId: valueEncryptionId,
          note: secret.note,
          updatedAt: new Date(),
          createdAt: new Date(),
          userId: user.id,
          containerId: envContainer.id,
        })

        // Add metadata for each secret
        metadataData.push({
          id: `metadata_${secret.id}`,
          type: secret.metadataType,
          status: SecretStatus.ACTIVE,
          otherInfo: [],
          secretId: secret.id,
        })
      }
    }

    if (workContainer) {
      // Legacy secrets in work container for backward compatibility
      const legacySecrets = [
        {
          id: `secret_aws_${user.id}`,
          name: "AWS Access Key",
          value: "AKIAIOSFODNN7EXAMPLE",
          note: "API key for AWS services",
          metadataType: SecretType.API_KEY,
        },
        {
          id: `secret_github_pat_${user.id}`,
          name: "GitHub PAT",
          value: "ghp_examplePersonalAccessTokenValue123456789",
          note: "PAT for GitHub API access",
          metadataType: SecretType.API_KEY,
        },
      ]

      for (const secret of legacySecrets) {
        // Prepare encrypted data ID
        const valueEncryptionId = `enc_secret_${secret.id}`

        // Encrypt secret value
        const encryptedValue = await encryptDataSync(
          secret.value,
          SEED_ENCRYPTION_CONFIG.MASTER_KEY,
          SEED_ENCRYPTION_CONFIG.SECRET_VALUE_IV
        )

        // Prepare encrypted data for secret value
        encryptedDataToCreate.push({
          id: valueEncryptionId,
          encryptedValue: encryptedValue,
          encryptionKey: SEED_ENCRYPTION_CONFIG.MASTER_KEY,
          iv: SEED_ENCRYPTION_CONFIG.SECRET_VALUE_IV,
        })

        // Prepare secret data
        secretsToCreate.push({
          id: secret.id,
          name: secret.name,
          valueEncryptionId: valueEncryptionId,
          note: secret.note,
          updatedAt: new Date(),
          createdAt: new Date(),
          userId: user.id,
          containerId: workContainer.id,
        })

        // Add metadata for each secret
        metadataData.push({
          id: `metadata_${secret.id}`,
          type: secret.metadataType,
          status: SecretStatus.ACTIVE,
          otherInfo: [],
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          secretId: secret.id,
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

    // Then create all secrets
    if (secretsToCreate.length > 0) {
      await tx.secret.createMany({
        data: secretsToCreate,
      })
    }

    // Finally create all metadata
    if (metadataData.length > 0) {
      await tx.secretMetadata.createMany({
        data: metadataData,
      })
    }
  })

  console.log("✅ Secrets seeded successfully")
}

export { seedSecrets }
