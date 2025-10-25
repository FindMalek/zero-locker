import Image from "next/image"
import Link from "next/link"
import { allArticles } from "@/content-collections"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Articles - Zero Locker",
  description: "Stay updated with the latest security insights, tips, and features from the Zero Locker team.",
}

export default function ArticlesPage() {
  return (
    <div className="container max-w-6xl px-4 py-16 md:py-24">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Zero Locker Articles</h1>
        <p className="text-muted-foreground text-lg">
          Stay updated with the latest security insights, tips, and features from our team.
        </p>
      </div>

      {featuredArticles.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-bold">Featured Articles</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredArticles.map((article) => (
              <Card key={article.id} className="group overflow-hidden transition-all hover:shadow-lg">
                <div className="relative aspect-video overflow-hidden">
                  {article.image ? (
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted">
                      <span className="text-muted-foreground text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {article.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {article.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>By {article.author}</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <Link
                    href={article.href}
                    className={buttonVariants({ variant: "outline", size: "sm", className: "w-full" })}
                  >
                    Read More
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-8 text-2xl font-bold">All Articles</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {regularArticles.map((article) => (
            <Card key={article.id} className="group overflow-hidden transition-all hover:shadow-lg">
              <div className="relative aspect-video overflow-hidden">
                {article.image ? (
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted">
                    <span className="text-muted-foreground text-sm">No Image</span>
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-2">
                  {article.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {article.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>By {article.author}</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
                <Link
                  href={article.href}
                  className={buttonVariants({ variant: "outline", size: "sm", className: "w-full" })}
                >
                  Read More
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {allArticles.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold mb-2">No articles yet</h3>
          <p className="text-muted-foreground">
            Check back soon for security insights and updates from our team.
          </p>
        </div>
      )}
    </div>
  )
}
