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
  Text,
  Tailwind,
} from "@react-email/components"

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
          {`Welcome to Zero-Locker waitlist! You're #${waitlistPosition}`}
        </Preview>
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] p-[32px] max-w-[600px] mx-auto">
            {/* Logo placeholder */}
            <Section className="text-center mb-[32px]">
              <Img
              // TODO: Please host the logo
                src="https://zero-locker.com/logos/logo.svg"
                alt="Zero-Locker Logo"
                className="w-[120px] h-auto object-cover mx-auto"
              />
            </Section>

            <Heading className="text-[24px] font-bold text-gray-900 mb-[24px] text-center">
              You&apos;re on the Zero-Locker waitlist! 🎉
            </Heading>

            <Text className="text-[16px] text-gray-700 mb-[16px]">
              Hi there!
            </Text>

            <Text className="text-[16px] text-gray-700 mb-[16px]">
              Thanks for joining the Zero-Locker waitlist with{" "}
              <strong>{email}</strong>. We&apos;re excited to have you on
              board!
            </Text>

            <Section className="bg-gray-50 rounded-[8px] p-[24px] mb-[24px] text-center">
              <Text className="text-[18px] font-bold text-gray-900 mb-[8px]">
                Your waitlist position:
              </Text>
              <Text className="text-[32px] font-bold text-blue-600">
                #{waitlistPosition}
              </Text>
            </Section>

            <Text className="text-[16px] text-gray-700 mb-[24px]">
              Zero-Locker is being built to revolutionize how you manage and
              secure your digital assets. We&apos;re working hard to bring you
              something amazing, and we can&apos;t wait to share it with you
              soon.
            </Text>

            <Text className="text-[16px] text-gray-700 mb-[24px]">
              Want to see what we&apos;re working on? Check out our{" "}
              <Link
                href="https://zero-locker.com/roadmap"
                className="text-blue-600 underline"
              >
                roadmap
              </Link>{" "}
              to stay updated on our progress.
            </Text>

            <Text className="text-[16px] text-gray-700 mb-[32px]">
              We&apos;ll keep you posted on our progress and let you know as
              soon as Zero-Locker is ready for you to try.
            </Text>

            <Text className="text-[16px] text-gray-700 mb-[8px]">
              Best regards,
            </Text>
            <Text className="text-[16px] font-semibold text-gray-900">
              The Zero-Locker Team
            </Text>

            {/* Footer */}
            <Section className="mt-[48px] pt-[24px] border-t border-gray-200">
              <Text className="text-[12px] text-gray-500 text-center m-0">
                © 2024 Zero-Locker. All rights reserved.
              </Text>
              <Text className="text-[12px] text-gray-500 text-center m-0 mt-[8px]">
                123 Innovation Street, Tech City, TC 12345
              </Text>
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

