/*
  Warnings:

  - The `otherInfo` column on the `CredentialMetadata` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "encryptionKey" TEXT,
ADD COLUMN     "iv" TEXT,
ADD COLUMN     "lastCopied" TIMESTAMP(3),
ADD COLUMN     "lastViewed" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ALTER COLUMN "billingAddress" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CredentialMetadata" DROP COLUMN "otherInfo",
ADD COLUMN     "otherInfo" JSONB[];

-- CreateTable
CREATE TABLE "CardHistory" (
    "id" TEXT NOT NULL,
    "oldNumber" TEXT NOT NULL,
    "newNumber" TEXT NOT NULL,
    "oldCvv" TEXT NOT NULL,
    "newCvv" TEXT NOT NULL,
    "oldExpiryDate" TIMESTAMP(3) NOT NULL,
    "newExpiryDate" TIMESTAMP(3) NOT NULL,
    "encryptionKey" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "CardHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardMetadata" (
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

    CONSTRAINT "CardMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CardToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CardToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "CardHistory_cardId_idx" ON "CardHistory"("cardId");

-- CreateIndex
CREATE INDEX "CardHistory_userId_idx" ON "CardHistory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CardMetadata_cardId_key" ON "CardMetadata"("cardId");

-- CreateIndex
CREATE INDEX "CardMetadata_cardId_idx" ON "CardMetadata"("cardId");

-- CreateIndex
CREATE INDEX "_CardToTag_B_index" ON "_CardToTag"("B");

-- AddForeignKey
ALTER TABLE "CardHistory" ADD CONSTRAINT "CardHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardHistory" ADD CONSTRAINT "CardHistory_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardMetadata" ADD CONSTRAINT "CardMetadata_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CardToTag" ADD CONSTRAINT "_CardToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CardToTag" ADD CONSTRAINT "_CardToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
