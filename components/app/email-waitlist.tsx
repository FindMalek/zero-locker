import * as React from "react"
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"

import { siteConfig } from "@/config/site"

import { EmailFooter } from "@/components/shared/email-footer"

interface EmailWaitlistProps {
  email: string
  waitlistPosition: number
}

export function EmailWaitlist({ email, waitlistPosition }: EmailWaitlistProps) {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>
          {`Welcome to ${siteConfig.name} waitlist! You're #${waitlistPosition}`}
        </Preview>
        <Body className="bg-white py-[24px] font-sans">
          <Container className="mx-auto max-w-[600px] bg-white">
            {/* Cover Image */}
            <Section className="mb-0">
              <Img
                src={`${siteConfig.url}/og.png`}
                alt={`${siteConfig.name} Cover`}
                className="w-full object-cover"
              />
            </Section>

            <Section className="px-[32px] py-[28px]">
              <Heading className="mb-[8px] text-center text-[24px] font-semibold leading-tight text-gray-900">
                You&apos;re on the waitlist
              </Heading>

              <Text className="mb-[24px] text-center text-[14px] text-gray-600">
                Thanks for joining, {email}
              </Text>

              <Section className="mb-[24px] border-b border-t border-gray-200 py-[20px] text-center">
                <Text className="mb-[8px] text-[13px] text-gray-500">
                  Your position
                </Text>
                <Text className="text-[32px] font-semibold leading-none text-orange-600">
                  #{waitlistPosition}
                </Text>
              </Section>

              <Text className="mb-[24px] text-[14px] leading-relaxed text-gray-700">
                We&apos;re building a secure password management solution.
                We&apos;ll notify you as soon as we&apos;re ready to launch.
              </Text>

              <Section className="mb-[24px] border-t border-gray-200 pt-[16px]">
                <Text className="text-[13px] text-gray-600">
                  Track our progress on the{" "}
                  <Link
                    href={`${siteConfig.url}/roadmap`}
                    className="text-orange-600 no-underline"
                  >
                    roadmap
                  </Link>
                </Text>
              </Section>

              <Text className="mb-0 text-[13px] text-gray-600">
                — The {siteConfig.name} Team
              </Text>

              <EmailFooter variant="simple" />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

EmailWaitlist.PreviewProps = {
  email: "hi@findmalek.com",
  waitlistPosition: 127,
} as EmailWaitlistProps

export default EmailWaitlist
