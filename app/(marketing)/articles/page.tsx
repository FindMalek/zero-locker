import type { Metadata } from "next"

import { siteConfig } from "@/config/site"

import { MarketingArticlesList } from "@/components/app/marketing-articles-list"
import { MarketingSubscription } from "@/components/app/marketing-subscription"

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Stay updated with the latest security insights, tips, and features from the Zero Locker team",
  openGraph: {
    title: `Articles | ${siteConfig.name}`,
    description:
      "Stay updated with the latest security insights, tips, and features from the Zero Locker team",
    url: `${siteConfig.url}/articles`,
  },
}

export default function ArticlesPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 md:max-w-4xl md:py-14 lg:max-w-5xl">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">The Articles</h1>

      <MarketingArticlesList />

      <div className="pt-12">
        <MarketingSubscription
          type="articles"
          description="Stay updated on our latest articles and insights"
        />
      </div>
    </div>
  )
}
