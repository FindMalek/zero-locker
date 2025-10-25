import { articleSchema } from "@/schemas/utils/article"
import { defineCollection, defineConfig } from "@content-collections/core"
import { compileMDX } from "@content-collections/mdx"

const articles = defineCollection({
  name: "articles",
  directory: "../data/articles",
  include: "**/*.mdx",
  schema: articleSchema,
  transform: async (document, context) => {
    const html = await compileMDX(context, document)
    return {
      ...document,
      html,
    }
  },
})

export default defineConfig({
  collections: [articles],
})
