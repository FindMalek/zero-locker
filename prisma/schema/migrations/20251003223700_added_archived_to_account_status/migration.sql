/*
  Warnings:

  - A unique constraint covering the columns `[userId,type,isDefault]` on the table `container` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[credentialMetadataId,key]` on the table `credential_key_value_pair` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "AccountStatus" ADD VALUE 'ARCHIVED';

-- DropForeignKey
ALTER TABLE "credential_key_value_pair" DROP CONSTRAINT "credential_key_value_pair_credentialMetadataId_fkey";

-- DropForeignKey
ALTER TABLE "credential_metadata" DROP CONSTRAINT "credential_metadata_credentialId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "container_userId_type_isDefault_key" ON "container"("userId", "type", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "credential_key_value_pair_credentialMetadataId_key_key" ON "credential_key_value_pair"("credentialMetadataId", "key");

-- AddForeignKey
ALTER TABLE "credential_metadata" ADD CONSTRAINT "credential_metadata_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "credential"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_key_value_pair" ADD CONSTRAINT "credential_key_value_pair_credentialMetadataId_fkey" FOREIGN KEY ("credentialMetadataId") REFERENCES "credential_metadata"("id") ON DELETE CASCADE ON UPDATE CASCADE;
