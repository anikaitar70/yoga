import type { MetadataRoute } from "next";
import { getMetadataBase } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getMetadataBase();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/api",
          "/*/preview",
          "/admin/content/preview",
          "/admin/pages/preview",
        ],
      },
    ],
    sitemap: new URL("/sitemap.xml", base).toString(),
    host: base.origin,
  };
}
