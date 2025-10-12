import type { Metadata } from "next"

import { siteConfig } from "@/config/site"

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

interface RoadmapItem {
  title: string
  description: string
  status: "done" | "in-progress" | "planned"
}

export default function RoadmapPage() {
  const roadmapItems: RoadmapItem[] = [
    {
      title: "Account Management",
      description: "user authentication and profile management",
      status: "done",
    },
    {
      title: "Secret Notes Management",
      description: "secure storage and encryption for private notes",
      status: "in-progress",
    },
    {
      title: "Cards Management",
      description: "organize and manage card-based content",
      status: "in-progress",
    },
    {
      title: "OpenAPI Docs",
      description: "comprehensive API documentation and integration guides",
      status: "planned",
    },
  ]

  return (
    <div className="text-foreground min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <h1 className="mb-16 font-mono text-3xl font-normal tracking-tight text-white">
          roadmap
        </h1>

        <div className="space-y-12">
          {roadmapItems.map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="flex-shrink-0 pt-1">
                <div
                  className={`size-2 rounded-full ${
                    item.status === "done"
                      ? "bg-emerald-500"
                      : item.status === "in-progress"
                        ? "bg-blue-500"
                        : "bg-gray-600"
                  }`}
                />
              </div>
              <div className="flex-1">
                <h2 className="mb-1 font-mono text-lg font-normal text-white">
                  {item.title}
                </h2>
                <p className="mb-2 font-mono text-sm text-gray-400">
                  {item.description}
                </p>
                <p
                  className={`font-mono text-xs ${
                    item.status === "done"
                      ? "text-emerald-500"
                      : item.status === "in-progress"
                        ? "text-blue-500"
                        : "text-gray-500"
                  }`}
                >
                  {item.status === "done"
                    ? "done"
                    : item.status === "in-progress"
                      ? "in progress"
                      : "not started"}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 border-t border-gray-800 pt-12">
          <MarketingRoadmapSubscription />
        </div>
      </div>
    </div>
  )
}
