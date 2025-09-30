/*
  Warnings:

  - A unique constraint covering the columns `[name,userId,containerId]` on the table `tag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tag_name_userId_containerId_key" ON "tag"("name", "userId", "containerId");
