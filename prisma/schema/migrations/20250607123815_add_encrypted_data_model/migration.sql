/*
  Warnings:

  - You are about to drop the column `cvv` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `encryptionKey` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `iv` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `encryptionKey` on the `CardHistory` table. All the data in the column will be lost.
  - You are about to drop the column `iv` on the `CardHistory` table. All the data in the column will be lost.
  - You are about to drop the column `newCvv` on the `CardHistory` table. All the data in the column will be lost.
  - You are about to drop the column `newNumber` on the `CardHistory` table. All the data in the column will be lost.
  - You are about to drop the column `oldCvv` on the `CardHistory` table. All the data in the column will be lost.
  - You are about to drop the column `oldNumber` on the `CardHistory` table. All the data in the column will be lost.
  - You are about to drop the column `encryptionKey` on the `Credential` table. All the data in the column will be lost.
  - You are about to drop the column `iv` on the `Credential` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Credential` table. All the data in the column will be lost.
  - You are about to drop the column `encryptionKey` on the `CredentialHistory` table. All the data in the column will be lost.
  - You are about to drop the column `iv` on the `CredentialHistory` table. All the data in the column will be lost.
  - You are about to drop the column `newPassword` on the `CredentialHistory` table. All the data in the column will be lost.
  - You are about to drop the column `oldPassword` on the `CredentialHistory` table. All the data in the column will be lost.
  - You are about to drop the column `encryptionKey` on the `Secret` table. All the data in the column will be lost.
  - You are about to drop the column `iv` on the `Secret` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Secret` table. All the data in the column will be lost.
  - Added the required column `cvvEncryptionId` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberEncryptionId` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `newCvvEncryptionId` to the `CardHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `newNumberEncryptionId` to the `CardHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oldCvvEncryptionId` to the `CardHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oldNumberEncryptionId` to the `CardHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordEncryptionId` to the `Credential` table without a default value. This is not possible if the table is not empty.
  - Added the required column `newPasswordEncryptionId` to the `CredentialHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `oldPasswordEncryptionId` to the `CredentialHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valueEncryptionId` to the `Secret` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Card" DROP COLUMN "cvv",
DROP COLUMN "encryptionKey",
DROP COLUMN "iv",
ADD COLUMN     "cvvEncryptionId" TEXT NOT NULL,
ADD COLUMN     "numberEncryptionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CardHistory" DROP COLUMN "encryptionKey",
DROP COLUMN "iv",
DROP COLUMN "newCvv",
DROP COLUMN "newNumber",
DROP COLUMN "oldCvv",
DROP COLUMN "oldNumber",
ADD COLUMN     "newCvvEncryptionId" TEXT NOT NULL,
ADD COLUMN     "newNumberEncryptionId" TEXT NOT NULL,
ADD COLUMN     "oldCvvEncryptionId" TEXT NOT NULL,
ADD COLUMN     "oldNumberEncryptionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Credential" DROP COLUMN "encryptionKey",
DROP COLUMN "iv",
DROP COLUMN "password",
ADD COLUMN     "passwordEncryptionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CredentialHistory" DROP COLUMN "encryptionKey",
DROP COLUMN "iv",
DROP COLUMN "newPassword",
DROP COLUMN "oldPassword",
ADD COLUMN     "newPasswordEncryptionId" TEXT NOT NULL,
ADD COLUMN     "oldPasswordEncryptionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Secret" DROP COLUMN "encryptionKey",
DROP COLUMN "iv",
DROP COLUMN "value",
ADD COLUMN     "valueEncryptionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "EncryptedData" (
    "id" TEXT NOT NULL,
    "encryptedValue" TEXT NOT NULL,
    "encryptionKey" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EncryptedData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EncryptedData_createdAt_idx" ON "EncryptedData"("createdAt");

-- CreateIndex
CREATE INDEX "Card_cvvEncryptionId_idx" ON "Card"("cvvEncryptionId");

-- CreateIndex
CREATE INDEX "Card_numberEncryptionId_idx" ON "Card"("numberEncryptionId");

-- CreateIndex
CREATE INDEX "CardHistory_oldNumberEncryptionId_idx" ON "CardHistory"("oldNumberEncryptionId");

-- CreateIndex
CREATE INDEX "CardHistory_newNumberEncryptionId_idx" ON "CardHistory"("newNumberEncryptionId");

-- CreateIndex
CREATE INDEX "CardHistory_oldCvvEncryptionId_idx" ON "CardHistory"("oldCvvEncryptionId");

-- CreateIndex
CREATE INDEX "CardHistory_newCvvEncryptionId_idx" ON "CardHistory"("newCvvEncryptionId");

-- CreateIndex
CREATE INDEX "Credential_passwordEncryptionId_idx" ON "Credential"("passwordEncryptionId");

-- CreateIndex
CREATE INDEX "CredentialHistory_oldPasswordEncryptionId_idx" ON "CredentialHistory"("oldPasswordEncryptionId");

-- CreateIndex
CREATE INDEX "CredentialHistory_newPasswordEncryptionId_idx" ON "CredentialHistory"("newPasswordEncryptionId");

-- CreateIndex
CREATE INDEX "Secret_valueEncryptionId_idx" ON "Secret"("valueEncryptionId");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_cvvEncryptionId_fkey" FOREIGN KEY ("cvvEncryptionId") REFERENCES "EncryptedData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_numberEncryptionId_fkey" FOREIGN KEY ("numberEncryptionId") REFERENCES "EncryptedData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardHistory" ADD CONSTRAINT "CardHistory_oldNumberEncryptionId_fkey" FOREIGN KEY ("oldNumberEncryptionId") REFERENCES "EncryptedData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardHistory" ADD CONSTRAINT "CardHistory_newNumberEncryptionId_fkey" FOREIGN KEY ("newNumberEncryptionId") REFERENCES "EncryptedData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardHistory" ADD CONSTRAINT "CardHistory_oldCvvEncryptionId_fkey" FOREIGN KEY ("oldCvvEncryptionId") REFERENCES "EncryptedData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardHistory" ADD CONSTRAINT "CardHistory_newCvvEncryptionId_fkey" FOREIGN KEY ("newCvvEncryptionId") REFERENCES "EncryptedData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_passwordEncryptionId_fkey" FOREIGN KEY ("passwordEncryptionId") REFERENCES "EncryptedData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CredentialHistory" ADD CONSTRAINT "CredentialHistory_oldPasswordEncryptionId_fkey" FOREIGN KEY ("oldPasswordEncryptionId") REFERENCES "EncryptedData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CredentialHistory" ADD CONSTRAINT "CredentialHistory_newPasswordEncryptionId_fkey" FOREIGN KEY ("newPasswordEncryptionId") REFERENCES "EncryptedData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Secret" ADD CONSTRAINT "Secret_valueEncryptionId_fkey" FOREIGN KEY ("valueEncryptionId") REFERENCES "EncryptedData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
