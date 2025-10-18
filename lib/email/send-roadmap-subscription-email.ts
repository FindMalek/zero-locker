import { env } from "@/env"

import { siteConfig } from "@/config/site"
import { resendClient } from "@/lib/email/resend-client"

import { EmailRoadmapSubscription } from "@/components/app/email-roadmap-subscription"

interface SendRoadmapSubscriptionEmailOptions {
  to: string
}

export async function sendRoadmapSubscriptionEmail({
  to,
}: SendRoadmapSubscriptionEmailOptions) {
  try {
    const { data, error } = await resendClient.emails.send({
      from: env.MARKETING_SUBSCRIPTION_EMAIL,
      to,
      subject: `You're Subscribed to ${siteConfig.name} Updates! 🎉`,
      react: EmailRoadmapSubscription({ email: to }),
    })

    if (error) {
      console.error("Failed to send roadmap subscription email:", error)
      throw new Error("Failed to send roadmap subscription email")
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending roadmap subscription email:", error)
    throw error
  }
}
