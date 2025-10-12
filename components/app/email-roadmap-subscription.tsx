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

interface EmailRoadmapSubscriptionProps {
  email: string
}

export function EmailRoadmapSubscription({
  email,
}: EmailRoadmapSubscriptionProps) {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>You&apos;re now subscribed to Zero-Locker updates!</Preview>
        <Body className="bg-gradient-to-br from-gray-50 to-gray-100 font-sans py-[60px]">
          <Container className="bg-white rounded-[16px] shadow-lg p-[48px] max-w-[560px] mx-auto border border-gray-200">
            {/* Logo placeholder */}
            <Section className="text-center mb-[40px]">
              <Img
                            // TODO: Please host the logo
                src="https://zero-locker.com/logos/logo.svg"
                alt="Zero-Locker Logo"
                className="w-[100px] h-auto object-cover mx-auto"
              />
            </Section>

            <Heading className="text-[28px] font-bold text-gray-900 mb-[16px] text-center leading-tight">
              You&apos;re all set! 🎉
            </Heading>

            <Text className="text-[18px] text-gray-600 mb-[32px] text-center">
              Welcome to the Zero-Locker community
            </Text>

            <Section className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-[12px] p-[32px] mb-[32px] text-center">
              <Text className="text-[16px] font-medium text-white mb-[4px]">
                Subscribed with
              </Text>
              <Text className="text-[18px] font-bold text-white">{email}</Text>
            </Section>

            <Text className="text-[16px] text-gray-700 mb-[24px] leading-relaxed">
              Thanks for joining us! You&apos;ll now be the first to know about
              Zero-Locker&apos;s journey as we build the future of digital
              asset management.
            </Text>

            <Section className="border-l-[4px] border-blue-500 pl-[20px] mb-[32px]">
              <Text className="text-[16px] font-semibold text-gray-900 mb-[16px]">
                What&apos;s coming your way:
              </Text>
              <Text className="text-[15px] text-gray-700 mb-[8px]">
                🚀 Product milestones and feature releases
              </Text>
              <Text className="text-[15px] text-gray-700 mb-[8px]">
                📋 Roadmap updates and behind-the-scenes insights
              </Text>
              <Text className="text-[15px] text-gray-700 mb-[8px]">
                🎯 Early access opportunities
              </Text>
              <Text className="text-[15px] text-gray-700">
                💡 Tips and best practices (when we launch)
              </Text>
            </Section>

            <Section className="text-center mb-[32px]">
              <Link
                href="https://zero-locker.com/roadmap"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-[12px] px-[24px] rounded-[8px] no-underline"
              >
                View Our Roadmap →
              </Link>
            </Section>

            <Text className="text-[14px] text-gray-500 mb-[32px] text-center italic">
              We respect your inbox. Only valuable updates, no spam. Promise!
              ✋
            </Text>

            <Section className="text-center">
              <Text className="text-[16px] text-gray-700 mb-[8px]">
                Excited to have you aboard,
              </Text>
              <Text className="text-[16px] font-bold text-gray-900">
                The Zero-Locker Team
              </Text>
            </Section>

            {/* Footer */}
            <Section className="mt-[48px] pt-[32px] border-t border-gray-100">
              <Text className="text-[12px] text-gray-400 text-center m-0">
                © 2024 Zero-Locker • All rights reserved
              </Text>
              <Text className="text-[12px] text-gray-400 text-center m-0 mt-[8px]">
                123 Innovation Street, Tech City, TC 12345
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

EmailRoadmapSubscription.PreviewProps = {
  email: "hi@findmalek.com",
} as EmailRoadmapSubscriptionProps

export default EmailRoadmapSubscription

