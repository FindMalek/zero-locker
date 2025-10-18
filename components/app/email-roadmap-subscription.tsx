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
        <Preview>
          You&apos;re now subscribed to {siteConfig.name} updates!
        </Preview>
        <Body className="bg-white py-[24px] font-sans">
          <Container className="mx-auto max-w-[600px] bg-white">
            {/* Cover Image */}
            <Section className="mb-0">
              <Img
                src={`${siteConfig.url}/email/roadmap.png`}
                alt={`${siteConfig.name} Roadmap`}
                className="w-full object-cover"
              />
            </Section>

            <Section className="px-[32px] py-[28px]">
              <Heading className="mb-[8px] text-center text-[24px] font-bold leading-tight text-gray-900">
                You&apos;re all set!
              </Heading>

              <Text className="mb-[24px] text-center text-[14px] text-gray-600">
                Welcome to the {siteConfig.name} community
              </Text>

              <Section className="mb-[24px] border-b border-t border-gray-200 py-[12px] text-center">
                <Text className="mb-[4px] text-[13px] text-gray-500">
                  {email}
                </Text>
              </Section>

              <Text className="mb-[24px] text-[14px] leading-relaxed text-gray-700">
                Thanks for joining us! You&apos;ll now be the first to know
                about our journey as we build the future of secure digital asset
                management.
              </Text>

              <Section className="mb-[24px]">
                <Text className="mb-[12px] text-[14px] font-medium text-gray-900">
                  What to expect:
                </Text>
                <Text className="mb-[4px] text-[13px] leading-relaxed text-gray-600">
                  • Product milestones and feature releases
                </Text>
                <Text className="mb-[4px] text-[13px] leading-relaxed text-gray-600">
                  • Roadmap updates and insights
                </Text>
                <Text className="mb-[4px] text-[13px] leading-relaxed text-gray-600">
                  • Early access opportunities
                </Text>
                <Text className="text-[13px] leading-relaxed text-gray-600">
                  • Tips and best practices
                </Text>
              </Section>

              <Section className="mb-[24px] text-center">
                <Link
                  href={`${siteConfig.url}/roadmap`}
                  className="inline-block rounded-[4px] bg-orange-600 px-[24px] py-[10px] text-[14px] font-medium text-white no-underline"
                >
                  View Roadmap
                </Link>
              </Section>

              <Section className="mb-0">
                <Text className="text-[13px] text-gray-600">
                  — The {siteConfig.name} Team
                </Text>
              </Section>

              <EmailFooter variant="detailed" />
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
