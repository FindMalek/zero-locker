/*
  Warnings:

  - The values [OTHER] on the enum `CardProvider` will be removed. If these variants are still used in the database, this will fail.
  - The values [OTHER] on the enum `SecretType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CardProvider_new" AS ENUM ('VISA', 'MASTERCARD', 'AMEX', 'DISCOVER', 'DINERS_CLUB', 'JCB', 'UNIONPAY');
ALTER TABLE "Card" ALTER COLUMN "provider" TYPE "CardProvider_new" USING ("provider"::text::"CardProvider_new");
ALTER TYPE "CardProvider" RENAME TO "CardProvider_old";
ALTER TYPE "CardProvider_new" RENAME TO "CardProvider";
DROP TYPE "CardProvider_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SecretType_new" AS ENUM ('API_KEY', 'ENV_VARIABLE', 'DATABASE_URL', 'CLOUD_STORAGE_KEY', 'THIRD_PARTY_API_KEY');
ALTER TABLE "Secret" ALTER COLUMN "type" TYPE "SecretType_new" USING ("type"::text::"SecretType_new");
ALTER TYPE "SecretType" RENAME TO "SecretType_old";
ALTER TYPE "SecretType_new" RENAME TO "SecretType";
DROP TYPE "SecretType_old";
COMMIT;
