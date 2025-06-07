import { PrismaClient, SecretStatus, SecretType } from "@prisma/client"

async function seedSecrets(prisma: PrismaClient) {
  console.log("🌱 Seeding secrets...")

  const users = await prisma.user.findMany()
  const containers = await prisma.container.findMany()

  const metadataData = []

  for (const user of users) {
    // Find the environment container for each user
    const envContainer = containers.find(
      (c) => c.userId === user.id && c.name === "Environment Variables"
    )

    // Find the work container for legacy secrets
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
          metadataType: SecretType.ENV_VARIABLE,
        },
        {
          id: `secret_redis_url_${user.id}`,
          name: "REDIS_URL",
          value: "redis://localhost:6379",
          note: "Redis connection URL for caching",
          metadataType: SecretType.ENV_VARIABLE,
        },
        {
          id: `secret_stripe_key_${user.id}`,
          name: "STRIPE_SECRET_KEY",
          value: "sk_test_1234567890abcdef1234567890abcdef",
          note: "Stripe secret key for payment processing",
          metadataType: SecretType.THIRD_PARTY_API_KEY,
        },
      ]

      for (const secret of secrets) {
        // Create encrypted data for secret value
        const valueEncryption = await prisma.encryptedData.create({
          data: {
            encryptedValue: secret.value,
            encryptionKey: "mock_encryption_key_for_development",
            iv: "mock_iv_for_development",
          },
        })

        await prisma.secret.create({
          data: {
            id: secret.id,
            name: secret.name,
            valueEncryptionId: valueEncryption.id,
            note: secret.note,
            updatedAt: new Date(),
            createdAt: new Date(),
            userId: user.id,
            containerId: envContainer.id,
          },
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
        // Create encrypted data for secret value
        const valueEncryption = await prisma.encryptedData.create({
          data: {
            encryptedValue: secret.value,
            encryptionKey: "mock_encryption_key_for_development",
            iv: "mock_iv_for_development",
          },
        })

        await prisma.secret.create({
          data: {
            id: secret.id,
            name: secret.name,
            valueEncryptionId: valueEncryption.id,
            note: secret.note,
            updatedAt: new Date(),
            createdAt: new Date(),
            userId: user.id,
            containerId: workContainer.id,
          },
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

  // Secrets are now created individually above

  await prisma.secretMetadata.createMany({
    data: metadataData,
  })

  console.log("✅ Secrets seeded successfully")
}

export { seedSecrets }
