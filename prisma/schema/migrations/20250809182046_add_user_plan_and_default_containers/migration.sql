-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('NORMAL', 'PRO');

-- AlterTable
ALTER TABLE "container" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "plan" "UserPlan" NOT NULL DEFAULT 'NORMAL';

-- CreateIndex
CREATE INDEX "container_isDefault_idx" ON "container"("isDefault");
