import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: 'cards.scryfall.io'} ],
  },
};

export default nextConfig;
