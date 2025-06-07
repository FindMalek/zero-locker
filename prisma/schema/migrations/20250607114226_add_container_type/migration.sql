/*
  Warnings:

  - You are about to drop the column `description` on the `Secret` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Secret` table. All the data in the column will be lost.
  - You are about to drop the column `platformId` on the `Secret` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Secret` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Secret` table. All the data in the column will be lost.
  - Added the required column `encryptionKey` to the `Secret` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iv` to the `Secret` table without a default value. This is not possible if the table is not empty.
  - Made the column `containerId` on table `Secret` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ContainerType" AS ENUM ('MIXED', 'SECRETS_ONLY', 'CREDENTIALS_ONLY', 'CARDS_ONLY');

-- DropForeignKey
ALTER TABLE "Secret" DROP CONSTRAINT "Secret_containerId_fkey";

-- DropForeignKey
ALTER TABLE "Secret" DROP CONSTRAINT "Secret_platformId_fkey";

-- DropIndex
DROP INDEX "Secret_platformId_idx";

-- AlterTable
ALTER TABLE "Container" ADD COLUMN     "containerType" "ContainerType" NOT NULL DEFAULT 'MIXED';

-- AlterTable
ALTER TABLE "Secret" DROP COLUMN "description",
DROP COLUMN "expiresAt",
DROP COLUMN "platformId",
DROP COLUMN "status",
DROP COLUMN "type",
ADD COLUMN     "encryptionKey" TEXT NOT NULL,
ADD COLUMN     "iv" TEXT NOT NULL,
ADD COLUMN     "lastCopied" TIMESTAMP(3),
ADD COLUMN     "lastViewed" TIMESTAMP(3),
ADD COLUMN     "note" TEXT,
ALTER COLUMN "containerId" SET NOT NULL;

-- CreateTable
CREATE TABLE "SecretMetadata" (
    "id" TEXT NOT NULL,
    "type" "SecretType" NOT NULL,
    "status" "SecretStatus" NOT NULL DEFAULT 'ACTIVE',
    "otherInfo" JSONB[],
    "expiresAt" TIMESTAMP(3),
    "secretId" TEXT NOT NULL,

    CONSTRAINT "SecretMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SecretMetadata_secretId_idx" ON "SecretMetadata"("secretId");

-- CreateIndex
CREATE INDEX "Container_containerType_idx" ON "Container"("containerType");

-- AddForeignKey
ALTER TABLE "Secret" ADD CONSTRAINT "Secret_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecretMetadata" ADD CONSTRAINT "SecretMetadata_secretId_fkey" FOREIGN KEY ("secretId") REFERENCES "Secret"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
