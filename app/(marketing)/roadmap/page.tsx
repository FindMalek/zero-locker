import type { Metadata } from "next"

import type { RoadmapItem } from "@/types"

import { siteConfig } from "@/config/site"

import { MarketingRoadmapList } from "@/components/app/marketing-roadmap-list"
import { MarketingRoadmapSubscription } from "@/components/app/marketing-roadmap-subscription"

export const metadata: Metadata = {
  title: "Roadmap",
  description: "Track our progress and see what's coming next to Zero Locker",
  openGraph: {
    title: `Roadmap | ${siteConfig.name}`,
    description: "Track our progress and see what's coming next to Zero Locker",
    url: `${siteConfig.url}/roadmap`,
  },
}

export default function RoadmapPage() {
  const roadmapItems: RoadmapItem[] = [
    {
      title: "Account Management",
      description: "user authentication and profile management",
      status: "in-progress",
    },
    {
      title: "Secret Notes Management",
      description: "secure storage and encryption for private notes",
      status: "planned",
    },
    {
      title: "Cards Management",
      description: "organize and manage card-based content",
      status: "planned",
    },
    {
      title: "OpenAPI Docs",
      description: "comprehensive API documentation and integration guides",
      status: "planned",
    },
  ]

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:max-w-4xl md:py-24 lg:max-w-5xl">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">The Roadmap</h1>

      <MarketingRoadmapList items={roadmapItems} />

      <div className="border-border mt-12 border-t pt-12">
        <MarketingRoadmapSubscription />
      </div>
    </div>
  )
}
