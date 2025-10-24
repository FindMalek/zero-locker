-- CreateEnum
CREATE TYPE "SubscriptionInterval" AS ENUM ('MONTHLY', 'YEARLY', 'WEEKLY', 'DAILY');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('TND', 'USD', 'EUR', 'GBP');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'UNPAID', 'CANCELLED', 'EXPIRED', 'ON_TRIAL', 'PAUSED');

-- CreateTable
CREATE TABLE "payment_product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'TND',
    "interval" "SubscriptionInterval" NOT NULL DEFAULT 'MONTHLY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_subscription" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "productId" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'TND',
    "endsAt" TIMESTAMP(3),
    "renewsAt" TIMESTAMP(3),
    "trialEndsAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "lastWebhookAt" TIMESTAMP(3),
    "webhookCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_product_productId_key" ON "payment_product"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_product_variantId_key" ON "payment_product"("variantId");

-- CreateIndex
CREATE INDEX "payment_product_productId_idx" ON "payment_product"("productId");

-- CreateIndex
CREATE INDEX "payment_product_variantId_idx" ON "payment_product"("variantId");

-- CreateIndex
CREATE INDEX "payment_product_isActive_idx" ON "payment_product"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "payment_subscription_subscriptionId_key" ON "payment_subscription"("subscriptionId");

-- CreateIndex
CREATE INDEX "payment_subscription_userId_idx" ON "payment_subscription"("userId");

-- CreateIndex
CREATE INDEX "payment_subscription_subscriptionId_idx" ON "payment_subscription"("subscriptionId");

-- CreateIndex
CREATE INDEX "payment_subscription_status_idx" ON "payment_subscription"("status");

-- CreateIndex
CREATE INDEX "payment_subscription_customerId_idx" ON "payment_subscription"("customerId");

-- AddForeignKey
ALTER TABLE "payment_subscription" ADD CONSTRAINT "payment_subscription_productId_fkey" FOREIGN KEY ("productId") REFERENCES "payment_product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_subscription" ADD CONSTRAINT "payment_subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
