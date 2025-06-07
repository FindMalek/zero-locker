/*
  Warnings:

  - The values [ENV_VARIABLE,THIRD_PARTY_API_KEY] on the enum `SecretType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `lastCopied` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `lastCopied` on the `Credential` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `Credential` table. All the data in the column will be lost.
  - You are about to drop the column `newPasswordEncryptionId` on the `CredentialHistory` table. All the data in the column will be lost.
  - You are about to drop the column `oldPasswordEncryptionId` on the `CredentialHistory` table. All the data in the column will be lost.
  - You are about to drop the column `lastCopied` on the `Secret` table. All the data in the column will be lost.
  - You are about to drop the `CardHistory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `identifier` to the `Credential` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordEncryptionId` to the `CredentialHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CardStatus" ADD VALUE 'PENDING';
ALTER TYPE "CardStatus" ADD VALUE 'CANCELLED';
ALTER TYPE "CardStatus" ADD VALUE 'FROZEN';
ALTER TYPE "CardStatus" ADD VALUE 'STOLEN';
ALTER TYPE "CardStatus" ADD VALUE 'SUSPENDED';

-- AlterEnum
BEGIN;
CREATE TYPE "SecretType_new" AS ENUM ('API_KEY', 'DATABASE_URL', 'CLOUD_STORAGE_KEY', 'SSH_KEY', 'JWT_SECRET', 'OAUTH_TOKEN', 'WEBHOOK_SECRET', 'ENCRYPTION_KEY', 'TOKEN');
ALTER TABLE "SecretMetadata" ALTER COLUMN "type" TYPE "SecretType_new" USING ("type"::text::"SecretType_new");
ALTER TYPE "SecretType" RENAME TO "SecretType_old";
ALTER TYPE "SecretType_new" RENAME TO "SecretType";
DROP TYPE "SecretType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "CardHistory" DROP CONSTRAINT "CardHistory_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardHistory" DROP CONSTRAINT "CardHistory_newCvvEncryptionId_fkey";

-- DropForeignKey
ALTER TABLE "CardHistory" DROP CONSTRAINT "CardHistory_newNumberEncryptionId_fkey";

-- DropForeignKey
ALTER TABLE "CardHistory" DROP CONSTRAINT "CardHistory_oldCvvEncryptionId_fkey";

-- DropForeignKey
ALTER TABLE "CardHistory" DROP CONSTRAINT "CardHistory_oldNumberEncryptionId_fkey";

-- DropForeignKey
ALTER TABLE "CardHistory" DROP CONSTRAINT "CardHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "CredentialHistory" DROP CONSTRAINT "CredentialHistory_newPasswordEncryptionId_fkey";

-- DropForeignKey
ALTER TABLE "CredentialHistory" DROP CONSTRAINT "CredentialHistory_oldPasswordEncryptionId_fkey";

-- DropIndex
DROP INDEX "CredentialHistory_newPasswordEncryptionId_idx";

-- DropIndex
DROP INDEX "CredentialHistory_oldPasswordEncryptionId_idx";

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "lastCopied",
DROP COLUMN "notes",
DROP COLUMN "number";

-- AlterTable
ALTER TABLE "Credential" DROP COLUMN "lastCopied",
DROP COLUMN "username",
ADD COLUMN     "identifier" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CredentialHistory" DROP COLUMN "newPasswordEncryptionId",
DROP COLUMN "oldPasswordEncryptionId",
ADD COLUMN     "passwordEncryptionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Secret" DROP COLUMN "lastCopied";

-- DropTable
DROP TABLE "CardHistory";

-- CreateIndex
CREATE INDEX "CredentialHistory_passwordEncryptionId_idx" ON "CredentialHistory"("passwordEncryptionId");

-- AddForeignKey
ALTER TABLE "CredentialHistory" ADD CONSTRAINT "CredentialHistory_passwordEncryptionId_fkey" FOREIGN KEY ("passwordEncryptionId") REFERENCES "EncryptedData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
