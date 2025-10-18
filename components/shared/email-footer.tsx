import { Link, Section, Text } from "@react-email/components"

import { siteConfig } from "@/config/site"

interface EmailFooterProps {
  /**
   * Style variant for the footer
   * - "simple": Basic copyright text (for waitlist emails)
   * - "detailed": Copyright + author link (for marketing emails)
   */
  variant?: "simple" | "detailed"
}

export function EmailFooter({ variant = "detailed" }: EmailFooterProps) {
  const currentYear = new Date().getFullYear()

  if (variant === "simple") {
    return (
      <Section className="mt-[48px] border-t border-gray-200 pt-[24px]">
        <Text className="m-0 text-center text-[12px] text-gray-500">
          © {currentYear} {siteConfig.name}. All rights reserved.
        </Text>
      </Section>
    )
  }

  return (
    <Section className="mt-[48px] border-t border-gray-100 pt-[32px]">
      <Text className="m-0 text-center text-[12px] text-gray-400">
        © {currentYear} {siteConfig.name} • All rights reserved
      </Text>
      <Text className="m-0 mt-[8px] text-center text-[12px]">
        <Link
          href={siteConfig.author.url}
          className="text-blue-600 no-underline hover:underline"
        >
          {siteConfig.author.name}
        </Link>
      </Text>
    </Section>
  )
}

