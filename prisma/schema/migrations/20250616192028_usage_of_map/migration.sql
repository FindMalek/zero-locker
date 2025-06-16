/*
  Warnings:

  - You are about to drop the `Card` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CardMetadata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Container` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Credential` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CredentialHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CredentialMetadata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EncryptedData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Platform` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Secret` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SecretMetadata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_containerId_fkey";

-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_cvvEncryptionId_fkey";

-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_numberEncryptionId_fkey";

-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_userId_fkey";

-- DropForeignKey
ALTER TABLE "CardMetadata" DROP CONSTRAINT "CardMetadata_cardId_fkey";

-- DropForeignKey
ALTER TABLE "Container" DROP CONSTRAINT "Container_userId_fkey";

-- DropForeignKey
ALTER TABLE "Credential" DROP CONSTRAINT "Credential_containerId_fkey";

-- DropForeignKey
ALTER TABLE "Credential" DROP CONSTRAINT "Credential_passwordEncryptionId_fkey";

-- DropForeignKey
ALTER TABLE "Credential" DROP CONSTRAINT "Credential_platformId_fkey";

-- DropForeignKey
ALTER TABLE "Credential" DROP CONSTRAINT "Credential_userId_fkey";

-- DropForeignKey
ALTER TABLE "CredentialHistory" DROP CONSTRAINT "CredentialHistory_credentialId_fkey";

-- DropForeignKey
ALTER TABLE "CredentialHistory" DROP CONSTRAINT "CredentialHistory_passwordEncryptionId_fkey";

-- DropForeignKey
ALTER TABLE "CredentialHistory" DROP CONSTRAINT "CredentialHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "CredentialMetadata" DROP CONSTRAINT "CredentialMetadata_credentialId_fkey";

-- DropForeignKey
ALTER TABLE "Platform" DROP CONSTRAINT "Platform_userId_fkey";

-- DropForeignKey
ALTER TABLE "Secret" DROP CONSTRAINT "Secret_containerId_fkey";

-- DropForeignKey
ALTER TABLE "Secret" DROP CONSTRAINT "Secret_userId_fkey";

-- DropForeignKey
ALTER TABLE "Secret" DROP CONSTRAINT "Secret_valueEncryptionId_fkey";

-- DropForeignKey
ALTER TABLE "SecretMetadata" DROP CONSTRAINT "SecretMetadata_secretId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_containerId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_userId_fkey";

-- DropForeignKey
ALTER TABLE "_CardToTag" DROP CONSTRAINT "_CardToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_CardToTag" DROP CONSTRAINT "_CardToTag_B_fkey";

-- DropForeignKey
ALTER TABLE "_CredentialToTag" DROP CONSTRAINT "_CredentialToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_CredentialToTag" DROP CONSTRAINT "_CredentialToTag_B_fkey";

-- DropTable
DROP TABLE "Card";

-- DropTable
DROP TABLE "CardMetadata";

-- DropTable
DROP TABLE "Container";

-- DropTable
DROP TABLE "Credential";

-- DropTable
DROP TABLE "CredentialHistory";

-- DropTable
DROP TABLE "CredentialMetadata";

-- DropTable
DROP TABLE "EncryptedData";

-- DropTable
DROP TABLE "Platform";

-- DropTable
DROP TABLE "Secret";

-- DropTable
DROP TABLE "SecretMetadata";

-- DropTable
DROP TABLE "Tag";

-- CreateTable
CREATE TABLE "card" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CardType" NOT NULL,
    "provider" "CardProvider" NOT NULL,
    "status" "CardStatus" NOT NULL DEFAULT 'ACTIVE',
    "cardholderName" TEXT NOT NULL,
    "billingAddress" TEXT,
    "cardholderEmail" TEXT,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "lastViewed" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "containerId" TEXT,
    "numberEncryptionId" TEXT NOT NULL,
    "cvvEncryptionId" TEXT NOT NULL,

    CONSTRAINT "card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_metadata" (
    "id" TEXT NOT NULL,
    "creditLimit" DECIMAL(65,30),
    "availableCredit" DECIMAL(65,30),
    "interestRate" DECIMAL(65,30),
    "annualFee" DECIMAL(65,30),
    "rewardsProgram" TEXT,
    "contactlessEnabled" BOOLEAN NOT NULL DEFAULT false,
    "onlinePaymentsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "internationalPaymentsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pinSet" BOOLEAN NOT NULL DEFAULT false,
    "otherInfo" JSONB[],
    "cardId" TEXT NOT NULL,

    CONSTRAINT "card_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credential" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "description" TEXT,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastViewed" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "platformId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "containerId" TEXT,
    "passwordEncryptionId" TEXT NOT NULL,

    CONSTRAINT "credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credential_history" (
    "id" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "passwordEncryptionId" TEXT NOT NULL,

    CONSTRAINT "credential_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credential_metadata" (
    "id" TEXT NOT NULL,
    "recoveryEmail" TEXT,
    "phoneNumber" TEXT,
    "otherInfo" JSONB[],
    "has2FA" BOOLEAN NOT NULL DEFAULT false,
    "credentialId" TEXT NOT NULL,

    CONSTRAINT "credential_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encrypted_data" (
    "id" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "encryptedValue" TEXT NOT NULL,
    "encryptionKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "encrypted_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secret" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "lastViewed" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "valueEncryptionId" TEXT NOT NULL,

    CONSTRAINT "secret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secret_metadata" (
    "id" TEXT NOT NULL,
    "type" "SecretType" NOT NULL,
    "status" "SecretStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "otherInfo" JSONB[],
    "secretId" TEXT NOT NULL,

    CONSTRAINT "secret_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "loginUrl" TEXT,
    "status" "PlatformStatus" NOT NULL DEFAULT 'PENDING',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "userId" TEXT,
    "containerId" TEXT,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "container" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT,
    "type" "ContainerType" NOT NULL DEFAULT 'MIXED',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "container_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "card_userId_idx" ON "card"("userId");

-- CreateIndex
CREATE INDEX "card_containerId_idx" ON "card"("containerId");

-- CreateIndex
CREATE INDEX "card_cvvEncryptionId_idx" ON "card"("cvvEncryptionId");

-- CreateIndex
CREATE INDEX "card_numberEncryptionId_idx" ON "card"("numberEncryptionId");

-- CreateIndex
CREATE UNIQUE INDEX "card_metadata_cardId_key" ON "card_metadata"("cardId");

-- CreateIndex
CREATE INDEX "card_metadata_cardId_idx" ON "card_metadata"("cardId");

-- CreateIndex
CREATE INDEX "credential_userId_idx" ON "credential"("userId");

-- CreateIndex
CREATE INDEX "credential_containerId_idx" ON "credential"("containerId");

-- CreateIndex
CREATE INDEX "credential_platformId_idx" ON "credential"("platformId");

-- CreateIndex
CREATE INDEX "credential_passwordEncryptionId_idx" ON "credential"("passwordEncryptionId");

-- CreateIndex
CREATE INDEX "credential_history_credentialId_idx" ON "credential_history"("credentialId");

-- CreateIndex
CREATE INDEX "credential_history_userId_idx" ON "credential_history"("userId");

-- CreateIndex
CREATE INDEX "credential_history_passwordEncryptionId_idx" ON "credential_history"("passwordEncryptionId");

-- CreateIndex
CREATE INDEX "credential_metadata_credentialId_idx" ON "credential_metadata"("credentialId");

-- CreateIndex
CREATE INDEX "encrypted_data_createdAt_idx" ON "encrypted_data"("createdAt");

-- CreateIndex
CREATE INDEX "secret_userId_idx" ON "secret"("userId");

-- CreateIndex
CREATE INDEX "secret_containerId_idx" ON "secret"("containerId");

-- CreateIndex
CREATE INDEX "secret_valueEncryptionId_idx" ON "secret"("valueEncryptionId");

-- CreateIndex
CREATE INDEX "secret_metadata_secretId_idx" ON "secret_metadata"("secretId");

-- CreateIndex
CREATE INDEX "platform_userId_idx" ON "platform"("userId");

-- CreateIndex
CREATE INDEX "tag_userId_idx" ON "tag"("userId");

-- CreateIndex
CREATE INDEX "tag_containerId_idx" ON "tag"("containerId");

-- CreateIndex
CREATE INDEX "container_userId_idx" ON "container"("userId");

-- CreateIndex
CREATE INDEX "container_type_idx" ON "container"("type");

-- AddForeignKey
ALTER TABLE "card" ADD CONSTRAINT "card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card" ADD CONSTRAINT "card_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "container"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card" ADD CONSTRAINT "card_numberEncryptionId_fkey" FOREIGN KEY ("numberEncryptionId") REFERENCES "encrypted_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card" ADD CONSTRAINT "card_cvvEncryptionId_fkey" FOREIGN KEY ("cvvEncryptionId") REFERENCES "encrypted_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_metadata" ADD CONSTRAINT "card_metadata_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential" ADD CONSTRAINT "credential_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential" ADD CONSTRAINT "credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential" ADD CONSTRAINT "credential_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "container"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential" ADD CONSTRAINT "credential_passwordEncryptionId_fkey" FOREIGN KEY ("passwordEncryptionId") REFERENCES "encrypted_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_history" ADD CONSTRAINT "credential_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_history" ADD CONSTRAINT "credential_history_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "credential"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_history" ADD CONSTRAINT "credential_history_passwordEncryptionId_fkey" FOREIGN KEY ("passwordEncryptionId") REFERENCES "encrypted_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_metadata" ADD CONSTRAINT "credential_metadata_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "credential"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secret" ADD CONSTRAINT "secret_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secret" ADD CONSTRAINT "secret_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secret" ADD CONSTRAINT "secret_valueEncryptionId_fkey" FOREIGN KEY ("valueEncryptionId") REFERENCES "encrypted_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secret_metadata" ADD CONSTRAINT "secret_metadata_secretId_fkey" FOREIGN KEY ("secretId") REFERENCES "secret"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform" ADD CONSTRAINT "platform_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "container"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container" ADD CONSTRAINT "container_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CardToTag" ADD CONSTRAINT "_CardToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CardToTag" ADD CONSTRAINT "_CardToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CredentialToTag" ADD CONSTRAINT "_CredentialToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "credential"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CredentialToTag" ADD CONSTRAINT "_CredentialToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
