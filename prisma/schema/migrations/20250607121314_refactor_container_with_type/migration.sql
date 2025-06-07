/*
  Warnings:

  - You are about to drop the column `containerType` on the `Container` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Container_containerType_idx";

-- AlterTable
ALTER TABLE "Container" DROP COLUMN "containerType",
ADD COLUMN     "type" "ContainerType" NOT NULL DEFAULT 'MIXED';

-- CreateIndex
CREATE INDEX "Container_type_idx" ON "Container"("type");
