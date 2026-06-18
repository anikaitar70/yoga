import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logBrandingTrace } from "@/lib/branding-diagnostics";

/** Single SiteConfig row — must match prisma/seed.js and consolidate-site-config.sh */
export const SITE_CONFIG_ID = "main";

type SiteConfigRecord = Prisma.SiteConfigGetPayload<Record<string, never>>;

const DEFAULT_SITE_CONFIG_CREATE: Prisma.SiteConfigCreateInput = {
  id: SITE_CONFIG_ID,
  name: "Nirvana Yoga",
  tagline: "Rooted in tradition. Guided by presence.",
  contactEmail: "hello@nirvanayoga.studio",
  contactPhone: "",
  contactAddress: "Japan",
  social: {
    nirvanaYogaInstagram: "https://www.instagram.com/nirvanyog1/",
    justArtAffaireInstagram: "https://www.instagram.com/justartaffaire/",
  },
};

export async function findSiteConfigRecord(): Promise<SiteConfigRecord | null> {
  const canonical = await prisma.siteConfig.findUnique({ where: { id: SITE_CONFIG_ID } });
  if (canonical) {
    return canonical;
  }

  const legacy = await prisma.siteConfig.findFirst({ orderBy: { updatedAt: "desc" } });
  if (legacy) {
    logBrandingTrace("site_config_fallback_read", {
      legacyId: legacy.id,
      reason: "canonical row missing",
    });
  }
  return legacy;
}

export async function updateSiteConfigRecord(
  data: Prisma.SiteConfigUpdateInput,
): Promise<SiteConfigRecord> {
  const result = await prisma.siteConfig.upsert({
    where: { id: SITE_CONFIG_ID },
    create: {
      ...DEFAULT_SITE_CONFIG_CREATE,
      ...(data as Prisma.SiteConfigCreateInput),
    },
    update: data,
  });

  const removed = await prisma.siteConfig.deleteMany({
    where: { id: { not: SITE_CONFIG_ID } },
  });

  if (removed.count > 0) {
    logBrandingTrace("site_config_dedupe", { removedRows: removed.count });
  }

  return prisma.siteConfig.findUniqueOrThrow({ where: { id: SITE_CONFIG_ID } });
}
