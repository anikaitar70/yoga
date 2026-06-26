import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { SITE_CONFIG_ID } from "@/lib/site-config-store";

/** Load localeContent JSON for i18n — optional column, degrades gracefully. */
export const loadSiteConfigRowForLocale = cache(async (): Promise<unknown | null> => {
  try {
    const row = await prisma.siteConfig.findUnique({
      where: { id: SITE_CONFIG_ID },
      select: { localeContent: true },
    });
    if (row?.localeContent) return row.localeContent;
    const fallback = await prisma.siteConfig.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { localeContent: true },
    });
    return fallback?.localeContent ?? null;
  } catch {
    return null;
  }
});
