import type { NextConfig } from "next";

const ngrokDevOrigin = process.env.NGROK_DEV_ORIGIN?.trim();
const allowedDevOrigins = ngrokDevOrigin ? [ngrokDevOrigin] : [];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Hides the bottom-left Next.js dev indicator overlay in development.
  devIndicators: false,
  // Keep Prisma on disk — do not bundle a stale generated client into Turbopack chunks.
  serverExternalPackages: ["@prisma/client", "prisma", "sharp", "tesseract.js", "tesseract.js-core"],
  // Required for ngrok: allows Next.js dev client bundles + hydration over tunnel
  ...(allowedDevOrigins.length > 0 ? { allowedDevOrigins } : {}),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.anytimefitness.co.in",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
