import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { allArticles } from "@/content-collections"
import { MDXContent } from "@content-collections/mdx/react"

import { Counter } from "@/components/shared/counter"
import { Icons } from "@/components/shared/icons"
import { buttonVariants } from "@/components/ui/button"

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
    <div className="container max-w-4xl px-4 py-16 md:py-24">
      <div className="relative mx-auto">
        <Link
          href="/articles"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "absolute -top-8 left-0",
          })}
        >
          <Icons.chevronLeft className="mr-1 size-4" />
          Back to Articles
        </Link>

        <div className="mb-8 pt-2">
          {image && (
            <div className="relative min-h-[200px] w-full overflow-hidden rounded-lg border bg-white md:min-h-[300px]">
              <Image
                src={image}
                alt={`${title} cover image`}
                className="object-cover"
                fill
                priority
              />
            </div>
          )}
        </div>

        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">{title}</h1>

          <p className="text-muted-foreground mb-6 text-lg">{description}</p>

          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <span>{new Date(publishedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {html && (
          <div className="prose prose-gray dark:prose-invert mx-auto max-w-3xl">
            <MDXContent
              code={html}
              components={{
                Counter,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
