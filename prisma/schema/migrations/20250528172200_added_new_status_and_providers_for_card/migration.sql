/*
  Warnings:

  - The values [STOLEN] on the enum `CardStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [OTHER] on the enum `CardType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CardStatus_new" AS ENUM ('ACTIVE', 'EXPIRED', 'INACTIVE', 'LOST', 'BLOCKED');
ALTER TABLE "Card" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Card" ALTER COLUMN "status" TYPE "CardStatus_new" USING ("status"::text::"CardStatus_new");
ALTER TYPE "CardStatus" RENAME TO "CardStatus_old";
ALTER TYPE "CardStatus_new" RENAME TO "CardStatus";
DROP TYPE "CardStatus_old";
ALTER TABLE "Card" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CardType_new" AS ENUM ('DEBIT', 'CREDIT', 'VIRTUAL', 'NATIONAL', 'PREPAID');
ALTER TABLE "Card" ALTER COLUMN "type" TYPE "CardType_new" USING ("type"::text::"CardType_new");
ALTER TYPE "CardType" RENAME TO "CardType_old";
ALTER TYPE "CardType_new" RENAME TO "CardType";
DROP TYPE "CardType_old";
COMMIT;
