import { env } from "@/env"

import { siteConfig } from "@/config/site"
import { resendClient } from "@/lib/email/resend-client"

import { EmailWaitlist } from "@/components/app/email-waitlist"

interface SendWaitlistEmailOptions {
  to: string
  waitlistPosition: number
}

export async function sendWaitlistEmail({
  to,
  waitlistPosition,
}: SendWaitlistEmailOptions) {
  try {
    const { data, error } = await resendClient.emails.send({
      from: env.MARKETING_SUBSCRIPTION_EMAIL,
      to,
      subject: `Welcome to ${siteConfig.name} Waitlist! You're #${waitlistPosition}`,
      react: EmailWaitlist({ email: to, waitlistPosition }),
    })

    if (error) {
      console.error("Failed to send waitlist email:", error)
      throw new Error("Failed to send waitlist email")
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending waitlist email:", error)
    throw error
  }
}
