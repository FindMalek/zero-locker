-- CreateTable
CREATE TABLE "roadmap_subscription" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roadmap_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roadmap_subscription_email_key" ON "roadmap_subscription"("email");

-- CreateIndex
CREATE INDEX "roadmap_subscription_email_idx" ON "roadmap_subscription"("email");
