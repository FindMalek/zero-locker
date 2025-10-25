import { env } from "@/env"

import { siteConfig } from "@/config/site"
import { resendClient } from "@/lib/email/resend-client"

import { EmailSubscription } from "@/components/app/email-roadmap-subscription"

interface SendSubscriptionEmailOptions {
  to: string
  type: "roadmap" | "articles"
}

export async function sendSubscriptionEmail({
  to,
  type,
}: SendSubscriptionEmailOptions) {
  try {
    const subject =
      type === "roadmap"
        ? `You're Subscribed to ${siteConfig.name} Roadmap Updates! 🎉`
        : `You're Subscribed to ${siteConfig.name} Articles! 📚`

    const { data, error } = await resendClient.emails.send({
      from: env.MARKETING_SUBSCRIPTION_EMAIL,
      to,
      subject,
      react: EmailSubscription({ email: to, type }),
    })

    if (error) {
      console.error(`Failed to send ${type} subscription email:`, error)
      throw new Error(`Failed to send ${type} subscription email`)
    }

    return { success: true, data }
  } catch (error) {
    console.error(`Error sending ${type} subscription email:`, error)
    throw error
  }
}

// Backward compatibility
export async function sendRoadmapSubscriptionEmail({ to }: { to: string }) {
  return sendSubscriptionEmail({ to, type: "roadmap" })
}
