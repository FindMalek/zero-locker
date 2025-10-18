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
      <Section className="mt-[32px] border-t border-gray-200 pt-[20px]">
        <Text className="m-0 text-center text-[12px] text-gray-500">
          © {currentYear} {siteConfig.name}. All rights reserved.
        </Text>
      </Section>
    )
  }

  return (
    <Section className="mt-[32px] border-t border-gray-200 pt-[20px]">
      <Text className="m-0 text-center text-[12px] text-gray-500">
        © {currentYear} {siteConfig.name} • All rights reserved
      </Text>
      <Text className="m-0 mt-[6px] text-center text-[12px]">
        <Link
          href={siteConfig.author.url}
          className="text-orange-600 no-underline hover:underline"
        >
          {siteConfig.author.name}
        </Link>
      </Text>
    </Section>
  )
}
