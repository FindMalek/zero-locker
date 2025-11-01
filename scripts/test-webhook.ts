import * as readline from "readline"

import { webhookInputSchema, type WebhookInput } from "@/schemas/utils"
import { config } from "dotenv"

// Load environment variables from .env file
config()

// Use test signature for local testing
// In production, Lemon Squeezy will send a proper signature
const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const getNgrokUrl = (): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(
      "Enter your ngrok URL (e.g., https://0e229b06cb16.ngrok-free.app): ",
      (url) => {
        rl.close()
        resolve(url.trim())
      }
    )
  })
}

interface WebhookPayload {
  payload: {
    meta: {
      event_name: string
      custom_data?: Record<string, unknown>
    }
    data: {
      type: string
      id: string
      attributes: Record<string, unknown>
    }
  }
}

const sendWebhook = async (ngrokUrl: string, webhookData: WebhookPayload) => {
  try {
    console.log(`\n📤 Sending webhook to: ${ngrokUrl}/api/orpc/webhooks/handle`)
    console.log("Payload:", JSON.stringify(webhookData, null, 2))

    const response = await fetch(`${ngrokUrl}/api/orpc/webhooks/handle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-signature": webhookSecret,
      },
      body: JSON.stringify(webhookData),
    })

    const responseText = await response.text()
    console.log(`\n📥 Response Status: ${response.status}`)

    // Try to parse as JSON
    let result
    try {
      result = JSON.parse(responseText)
      if (result.json) {
        // oRPC response format
        const responseData = result.json
        if (responseData.success) {
          console.log("✅ Webhook processed successfully!")
          console.log(`   Message: ${responseData.message}`)
          console.log(`   Processed: ${responseData.processed}`)
        } else {
          console.log("⚠️  Webhook processed but failed:")
          console.log(`   Message: ${responseData.message}`)
        }
      } else {
        console.log("📄 Response:", JSON.stringify(result, null, 2))
      }
    } catch {
      // If not JSON, show first 500 chars of response
      const preview = responseText.substring(0, 500)
      console.log("⚠️  Non-JSON Response (first 500 chars):")
      console.log(preview)

      if (
        responseText.includes("<!DOCTYPE") ||
        responseText.includes("<html")
      ) {
        console.log("\n💡 Tip: This looks like an ngrok interstitial page.")
        console.log(
          "   Visit the URL in your browser first to bypass the interstitial."
        )
      }
      result = { raw: preview, isHtml: true }
    }

    return result
  } catch (error) {
    console.error("❌ Error sending webhook:", error)
    throw error
  }
}

// Example webhook payload for subscription_created
// This should match webhookInputSchema structure
// Uses seeded user data from prisma/seed/users.ts (user_1 / john.doe@example.com)
const subscriptionCreatedPayload: WebhookInput = {
  payload: {
    meta: {
      event_name: "subscription_created",
      custom_data: {
        userId: "user_1", // Seeded user ID from users.ts
      },
    },
    data: {
      type: "subscriptions",
      id: "test-subscription-123",
      attributes: {
        customer_id: "test-customer-123",
        user_email: "john.doe@example.com", // Seeded user email from users.ts
        order_id: "test-order-123",
        product_id: "pro-plan", // Seeded PRO plan product ID
        product_name: "PRO Plan",
        product_description: "Pro plan with monthly billing",
        variant_id: "pro-plan-variant", // Seeded PRO plan variant ID
        price: 999, // $9.99 in cents (Lemon Squeezy format)
        currency: "usd",
        renewal_interval: "monthly",
        status: "active",
        renews_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        ends_at: null,
        trial_ends_at: null,
      },
    },
  },
}

// Validate the payload against the schema
try {
  webhookInputSchema.parse(subscriptionCreatedPayload)
  console.log("✅ Payload matches webhookInputSchema")
} catch (error) {
  console.error("❌ Payload validation error:", error)
  process.exit(1)
}

async function main() {
  console.log("🧪 Zero Locker Webhook Test Script\n")

  // Get ngrok URL from environment or prompt
  const ngrokUrl = await getNgrokUrl()

  if (!ngrokUrl) {
    console.error("❌ No ngrok URL provided")
    process.exit(1)
  }

  // Clean up the URL
  const cleanUrl = ngrokUrl.replace(/\/$/, "")

  console.log(`\n🔗 Testing webhook with URL: ${cleanUrl}`)

  // Test subscription_created event
  console.log("\n📝 Testing subscription_created event...")
  await sendWebhook(cleanUrl, subscriptionCreatedPayload)

  console.log("\n✅ Webhook test completed!")
}

main().catch((error) => {
  console.error("❌ Test failed:", error)
  process.exit(1)
})
