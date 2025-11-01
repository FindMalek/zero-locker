import {
  Currency,
  InvoiceStatus,
  PaymentTransactionStatus,
  Prisma,
  PrismaClient,
  SubscriptionChangeSource,
  SubscriptionInterval,
  SubscriptionStatus,
} from "@prisma/client"

async function seedPayments(prisma: PrismaClient) {
  console.log("🌱 Seeding payment products...")

  // Get seeded users
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  })

  if (users.length === 0) {
    console.log("⚠️  Skipping payment seeding - no users found")
    return
  }

  // Create PRO plan product - $9.99 USD monthly
  // Note: The productId and variantId should match your actual Lemon Squeezy product/variant IDs
  // For testing purposes, we use placeholder values that match the test webhook payload
  const proProduct = await prisma.paymentProduct.upsert({
    where: { productId: "pro-plan" },
    update: {
      variantId: "pro-plan-variant",
      name: "PRO Plan",
      description: "Pro plan with monthly billing",
      price: 9.99,
      currency: Currency.USD,
      interval: SubscriptionInterval.MONTHLY,
      isActive: true,
    },
    create: {
      productId: "pro-plan",
      variantId: "pro-plan-variant",
      name: "PRO Plan",
      description: "Pro plan with monthly billing",
      price: 9.99,
      currency: Currency.USD,
      interval: SubscriptionInterval.MONTHLY,
      isActive: true,
    },
  })
  console.log(
    `✅ Created/Updated product: ${proProduct.name} ($${proProduct.price} ${proProduct.currency}/${proProduct.interval})`
  )

  // Note: We don't seed the test-subscription-123 subscription here because
  // the subscription_created webhook event is meant to CREATE it.
  // However, we can create other subscriptions for testing other webhook events.

  // Prepare arrays for batch operations
  const subscriptionsToCreate: Prisma.PaymentSubscriptionCreateManyInput[] = []
  const transactionsToCreate: Prisma.PaymentTransactionCreateManyInput[] = []
  const invoicesToCreate: Prisma.InvoiceCreateManyInput[] = []
  const subscriptionHistoryToCreate: Prisma.PaymentSubscriptionHistoryCreateManyInput[] =
    []

  // Create subscriptions for testing other webhook events (updated, cancelled, etc.)
  // Use the second user (user_2 / jane.smith@example.com) for testing subscription updates
  if (users.length > 1) {
    const secondUser = users[1]
    const now = new Date()
    const subscriptionId = `subscription-${secondUser.id}`
    const subscriptionInternalId = `sub_${secondUser.id}`
    const renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    // Prepare subscription data (using pre-generated ID for foreign key references)
    subscriptionsToCreate.push({
      id: subscriptionInternalId,
      subscriptionId,
      orderId: `order-${secondUser.id}`,
      customerId: `customer-${secondUser.id}`,
      status: SubscriptionStatus.ACTIVE,
      productId: proProduct.id,
      price: 9.99,
      currency: Currency.USD,
      renewsAt,
      endsAt: null,
      trialEndsAt: null,
      userId: secondUser.id,
      lastWebhookAt: now,
      webhookCount: 0,
    })

    // Prepare transaction data (pre-generate ID for invoice reference)
    const billingPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const billingPeriodEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    )
    const transactionInternalId = `txn_${secondUser.id}_${now.getTime()}`
    const transactionExternalId = `transaction-${secondUser.id}-${now.getTime()}`

    transactionsToCreate.push({
      id: transactionInternalId,
      transactionId: transactionExternalId,
      subscriptionId: subscriptionInternalId,
      amount: 9.99,
      currency: Currency.USD,
      status: PaymentTransactionStatus.SUCCESS,
      description: "Monthly subscription payment",
      paymentDate: now,
      billingPeriodStart,
      billingPeriodEnd,
    })

    // Prepare invoice data (using pre-generated transaction ID)
    const invoiceNumber = `INV-${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    )}-${String(transactionInternalId.slice(-6)).toUpperCase()}`

    invoicesToCreate.push({
      invoiceNumber,
      subscriptionId: subscriptionInternalId,
      transactionId: transactionInternalId,
      amount: 9.99,
      currency: Currency.USD,
      status: InvoiceStatus.PAID,
      dueDate: billingPeriodStart,
      paidAt: now,
      billingPeriodStart,
      billingPeriodEnd,
      notes: "Monthly subscription invoice",
    })

    // Prepare subscription history data
    subscriptionHistoryToCreate.push({
      subscriptionId: subscriptionInternalId,
      newStatus: SubscriptionStatus.ACTIVE,
      newPrice: 9.99,
      reason: "Initial subscription creation",
      changedBy: SubscriptionChangeSource.SYSTEM,
      metadata: {
        source: "seed",
        createdAt: now.toISOString(),
      },
    })
  }

  // Use a transaction to batch all operations
  await prisma.$transaction(async (tx) => {
    // Create all subscriptions first
    if (subscriptionsToCreate.length > 0) {
      await tx.paymentSubscription.createMany({
        data: subscriptionsToCreate,
        skipDuplicates: true,
      })
      console.log(
        `✅ Created ${subscriptionsToCreate.length} subscription(s) via createMany`
      )
    }

    // Then create all transactions
    if (transactionsToCreate.length > 0) {
      await tx.paymentTransaction.createMany({
        data: transactionsToCreate,
        skipDuplicates: true,
      })
      console.log(
        `✅ Created ${transactionsToCreate.length} transaction(s) via createMany`
      )
    }

    // Then create all invoices
    if (invoicesToCreate.length > 0) {
      await tx.invoice.createMany({
        data: invoicesToCreate,
        skipDuplicates: true,
      })
      console.log(
        `✅ Created ${invoicesToCreate.length} invoice(s) via createMany`
      )
    }

    // Finally create all subscription history entries
    if (subscriptionHistoryToCreate.length > 0) {
      await tx.paymentSubscriptionHistory.createMany({
        data: subscriptionHistoryToCreate,
        skipDuplicates: true,
      })
      console.log(
        `✅ Created ${subscriptionHistoryToCreate.length} subscription history entry/entries via createMany`
      )
    }
  })

  console.log("✅ Payment products seeded successfully")
}

export { seedPayments }
