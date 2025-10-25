import type { NextConfig } from "next";
import { createContentCollectionPlugin } from "@content-collections/next";

const withPlugin = createContentCollectionPlugin({
  configPath: "./lib/content-collections.ts",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.logo.dev',
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
      },
      {
        protocol: 'https',
        hostname: 'www.malekgarahellal.com',
      },
      {
        protocol: 'https',
        hostname: 'www.findmalek.com',
      },
    ],
  },
};

export default withPlugin(nextConfig);
