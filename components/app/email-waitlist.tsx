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
        <Body className="bg-gray-100 py-[40px] font-sans">
          <Container className="mx-auto max-w-[600px] rounded-[8px] bg-white p-[32px]">
            <Section className="mb-[32px] text-center">
              <Img
                src={siteConfig.images.logo}
                alt={siteConfig.name}
                className="mx-auto h-auto w-[120px] object-cover"
              />
            </Section>

            <Heading className="mb-[24px] text-center text-[24px] font-bold text-gray-900">
              You&apos;re on the {siteConfig.name} waitlist! 🎉
            </Heading>

            <Text className="mb-[16px] text-[16px] text-gray-700">
              Hi there!
            </Text>

            <Text className="mb-[16px] text-[16px] text-gray-700">
              Thanks for joining the {siteConfig.name} waitlist with{" "}
              <strong>{email}</strong>. We&apos;re excited to have you on board!
            </Text>

            <Section className="mb-[24px] rounded-[8px] bg-gray-50 p-[24px] text-center">
              <Text className="mb-[8px] text-[18px] font-bold text-gray-900">
                Your waitlist position:
              </Text>
              <Text className="text-[32px] font-bold text-blue-600">
                #{waitlistPosition}
              </Text>
            </Section>

            <Text className="mb-[24px] text-[16px] text-gray-700">
              {siteConfig.name} is being built to revolutionize how you manage and
              secure your digital assets. We&apos;re working hard to bring you
              something amazing, and we can&apos;t wait to share it with you
              soon.
            </Text>

            <Text className="mb-[24px] text-[16px] text-gray-700">
              Want to see what we&apos;re working on? Check out our{" "}
              <Link
                href="https://zero-locker.com/roadmap"
                className="text-blue-600 underline"
              >
                roadmap
              </Link>{" "}
              to stay updated on our progress.
            </Text>

            <Text className="mb-[32px] text-[16px] text-gray-700">
              We&apos;ll keep you posted on our progress and let you know as
              soon as {siteConfig.name} is ready for you to try.
            </Text>

            <Text className="mb-[8px] text-[16px] text-gray-700">
              Best regards,
            </Text>
            <Text className="text-[16px] font-semibold text-gray-900">
              The {siteConfig.name} Team
            </Text>

            <EmailFooter variant="simple" />
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
