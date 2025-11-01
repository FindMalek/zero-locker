import {
  Currency,
  PrismaClient,
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

  // Create subscriptions for testing other webhook events (updated, cancelled, etc.)
  // Use the second user (user_2 / jane.smith@example.com) for testing subscription updates
  if (users.length > 1) {
    const secondUser = users[1]

    const proSubscription = await prisma.paymentSubscription.upsert({
      where: { subscriptionId: `subscription-${secondUser.id}` },
      update: {
        status: SubscriptionStatus.ACTIVE,
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      create: {
        subscriptionId: `subscription-${secondUser.id}`,
        orderId: `order-${secondUser.id}`,
        customerId: `customer-${secondUser.id}`,
        status: SubscriptionStatus.ACTIVE,
        productId: proProduct.id,
        price: 9.99,
        currency: Currency.USD,
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        endsAt: null,
        trialEndsAt: null,
        userId: secondUser.id,
        lastWebhookAt: new Date(),
        webhookCount: 0,
      },
    })
    console.log(
      `✅ Created/Updated subscription: ${proSubscription.subscriptionId} for user ${secondUser.email} (for testing webhook events)`
    )
  }

  console.log("✅ Payment products seeded successfully")
}

export { seedPayments }
