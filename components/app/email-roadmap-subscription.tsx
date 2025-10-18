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
        <Preview>You&apos;re now subscribed to {siteConfig.name} updates!</Preview>
        <Body className="bg-gradient-to-br from-gray-50 to-gray-100 py-[60px] font-sans">
          <Container className="mx-auto max-w-[560px] rounded-[16px] border border-gray-200 bg-white p-[48px] shadow-lg">
            <Section className="mb-[40px] text-center">
              <Img
                src={siteConfig.images.logo}
                alt={siteConfig.name}
                className="mx-auto h-auto w-[100px] object-cover"
              />
            </Section>

            <Heading className="mb-[16px] text-center text-[28px] font-bold leading-tight text-gray-900">
              You&apos;re all set! 🎉
            </Heading>

            <Text className="mb-[32px] text-center text-[18px] text-gray-600">
              Welcome to the {siteConfig.name} community
            </Text>

            <Section className="mb-[32px] rounded-[12px] bg-gradient-to-r from-blue-500 to-purple-600 p-[32px] text-center">
              <Text className="mb-[4px] text-[16px] font-medium text-white">
                Subscribed with
              </Text>
              <Text className="text-[18px] font-bold text-white">{email}</Text>
            </Section>

            <Text className="mb-[24px] text-[16px] leading-relaxed text-gray-700">
              Thanks for joining us! You&apos;ll now be the first to know about
              {siteConfig.name}&apos;s journey as we build the future of digital asset
              management.
            </Text>

            <Section className="mb-[32px] border-l-[4px] border-blue-500 pl-[20px]">
              <Text className="mb-[16px] text-[16px] font-semibold text-gray-900">
                What&apos;s coming your way:
              </Text>
              <Text className="mb-[8px] text-[15px] text-gray-700">
                🚀 Product milestones and feature releases
              </Text>
              <Text className="mb-[8px] text-[15px] text-gray-700">
                📋 Roadmap updates and behind-the-scenes insights
              </Text>
              <Text className="mb-[8px] text-[15px] text-gray-700">
                🎯 Early access opportunities
              </Text>
              <Text className="text-[15px] text-gray-700">
                💡 Tips and best practices (when we launch)
              </Text>
            </Section>

            <Section className="mb-[32px] text-center">
              <Link
                href={`${siteConfig.url}/roadmap`}
                className="inline-block rounded-[8px] bg-gradient-to-r from-blue-600 to-purple-600 px-[24px] py-[12px] font-semibold text-white no-underline"
              >
                View Our Roadmap →
              </Link>
            </Section>

            <Text className="mb-[32px] text-center text-[14px] italic text-gray-500">
              We respect your inbox. Only valuable updates, no spam. Promise! ✋
            </Text>

            <Section className="text-center">
              <Text className="mb-[8px] text-[16px] text-gray-700">
                Excited to have you aboard,
              </Text>
              <Text className="text-[16px] font-bold text-gray-900">
                The {siteConfig.name} Team
              </Text>
            </Section>

            <EmailFooter variant="detailed" />
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
