-- CreateEnum
CREATE TYPE "SubscriptionInterval" AS ENUM ('MONTHLY', 'YEARLY', 'WEEKLY', 'DAILY');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('TND', 'USD', 'EUR', 'GBP');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'UNPAID', 'CANCELLED', 'EXPIRED', 'ON_TRIAL', 'PAUSED');

-- CreateEnum
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionChangeSource" AS ENUM ('USER', 'SYSTEM', 'WEBHOOK', 'ADMIN');

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
    "cancelledReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "lastWebhookAt" TIMESTAMP(3),
    "webhookCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transaction" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'TND',
    "status" "PaymentTransactionStatus" NOT NULL,
    "description" TEXT,
    "paymentDate" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "refundAmount" DECIMAL(65,30),
    "billingPeriodStart" TIMESTAMP(3),
    "billingPeriodEnd" TIMESTAMP(3),
    "failureReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'TND',
    "status" "InvoiceStatus" NOT NULL,
    "dueDate" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "billingPeriodStart" TIMESTAMP(3),
    "billingPeriodEnd" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_subscription_history" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "previousStatus" "SubscriptionStatus",
    "newStatus" "SubscriptionStatus" NOT NULL,
    "previousPrice" DECIMAL(65,30),
    "newPrice" DECIMAL(65,30),
    "reason" TEXT,
    "metadata" JSONB,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" "SubscriptionChangeSource",

    CONSTRAINT "payment_subscription_history_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE INDEX "payment_subscription_orderId_idx" ON "payment_subscription"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transaction_transactionId_key" ON "payment_transaction"("transactionId");

-- CreateIndex
CREATE INDEX "payment_transaction_subscriptionId_idx" ON "payment_transaction"("subscriptionId");

-- CreateIndex
CREATE INDEX "payment_transaction_transactionId_idx" ON "payment_transaction"("transactionId");

-- CreateIndex
CREATE INDEX "payment_transaction_status_idx" ON "payment_transaction"("status");

-- CreateIndex
CREATE INDEX "payment_transaction_paymentDate_idx" ON "payment_transaction"("paymentDate");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoiceNumber_key" ON "invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_transactionId_key" ON "invoice"("transactionId");

-- CreateIndex
CREATE INDEX "invoice_subscriptionId_idx" ON "invoice"("subscriptionId");

-- CreateIndex
CREATE INDEX "invoice_invoiceNumber_idx" ON "invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoice_status_idx" ON "invoice"("status");

-- CreateIndex
CREATE INDEX "invoice_dueDate_idx" ON "invoice"("dueDate");

-- CreateIndex
CREATE INDEX "invoice_transactionId_idx" ON "invoice"("transactionId");

-- CreateIndex
CREATE INDEX "payment_subscription_history_subscriptionId_idx" ON "payment_subscription_history"("subscriptionId");

-- CreateIndex
CREATE INDEX "payment_subscription_history_newStatus_idx" ON "payment_subscription_history"("newStatus");

-- CreateIndex
CREATE INDEX "payment_subscription_history_changedAt_idx" ON "payment_subscription_history"("changedAt");

-- AddForeignKey
ALTER TABLE "payment_subscription" ADD CONSTRAINT "payment_subscription_productId_fkey" FOREIGN KEY ("productId") REFERENCES "payment_product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_subscription" ADD CONSTRAINT "payment_subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "payment_subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "payment_subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "payment_transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_subscription_history" ADD CONSTRAINT "payment_subscription_history_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "payment_subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
