import { SiteConfig } from "@/types"

export const siteConfig: SiteConfig = {
  name: "Zero Locker",
  description: "Secure password management made simple.",
  url: "https://www.0locker.com",
  images: {
    default: "https://www.0locker.com/og.png",
    notFound: "https://www.0locker.com/not-found.png",
    logo: "https://emojicdn.elk.sh/🔒?style=twitter",
  },
  links: {
    twitter: "https://twitter.com/foundmalek",
    github: "https://github.com/findmalek/zero-locker",
  },
  author: {
    name: "Malek Gara-Hellal",
    url: "https://findmalek.com",
    email: "hi@findmalek.com",
    github: "https://github.com/findmalek",
  },
  keywords: [
    "Password Management",
    "Secure Storage",
    "Password Generation",
    "Account Details Management",
    "Password History",
    "Authentication",
    "User Interface",
    "Migration",
    "Next.js",
    "React",
    "TypeScript",
    "Prisma",
    "TailwindCSS",
    "BetterAuth",
    "Encryption",
    "AES-256",
    "Vercel",
  ],
}

export const notFoundMetadata = () => {
  return {
    title: "Page not found",
    description: "Page not found",
    openGraph: {
      title: `${siteConfig.name} | Page not found`,
      description: "Page not found",
      images: [
        {
          url: siteConfig.images.notFound,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteConfig.name} | Page not found`,
      description: "Page not found",
      images: [siteConfig.images.notFound],
      creator: "@findmalek",
    },
  }
}
