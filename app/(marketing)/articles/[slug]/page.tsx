import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { allArticles } from "@/content-collections"
import { MDXContent } from "@content-collections/mdx/react"

import { DateFormatter } from "@/lib/date-utils"

import { Counter } from "@/components/shared/counter"
import { Icons } from "@/components/shared/icons"
import { buttonVariants } from "@/components/ui/button"
import { Link as CustomLink } from "@/components/ui/link"

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return allArticles.map((article) => ({
    slug: article.href.split("/").pop(),
  }))
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = allArticles.find(
    (article) => article.href === `/articles/${slug}`
  )

  if (!article) {
    notFound()
  }

  return {
    title: `${article.title}`,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      images: article.image ? [article.image] : [],
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params

  const article = allArticles.find(
    (article) => article.href === `/articles/${slug}`
  )

  if (!article) {
    notFound()
  }

  const { image, title, description, publishedAt, html } = article

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 md:py-24">
      <div className="relative">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/articles"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
            })}
          >
            <Icons.chevronLeft className="mr-1 size-4" />
            Back to Articles
          </Link>

          <div className="text-muted-foreground text-sm">
            {DateFormatter.formatShortDate(publishedAt)}
          </div>
        </div>

        <header className="mb-12">
          <h1 className="text-foreground mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>

          <p className="text-muted-foreground mb-6 text-xl leading-relaxed">
            {description}
          </p>
        </header>

        {image && (
          <div className="mb-12">
            <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-xl border">
              <Image
                src={image}
                alt={`${title} cover image`}
                className="object-cover"
                fill
                priority
              />
            </div>
          </div>
        )}

        {html && (
          <article className="prose prose-lg prose-gray dark:prose-invert max-w-none">
            <MDXContent
              code={html}
              components={{
                Counter,
                a: CustomLink,
              }}
            />
          </article>
        )}
      </div>
    </div>
  )
}
