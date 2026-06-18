import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Single SiteConfig row — must match prisma/seed.js and consolidate-site-config.js */
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
  return prisma.siteConfig.findUnique({ where: { id: SITE_CONFIG_ID } });
}

export async function updateSiteConfigRecord(
  data: Prisma.SiteConfigUpdateInput,
): Promise<SiteConfigRecord> {
  return prisma.siteConfig.upsert({
    where: { id: SITE_CONFIG_ID },
    create: {
      ...DEFAULT_SITE_CONFIG_CREATE,
      ...(data as Prisma.SiteConfigCreateInput),
    },
    update: data,
  });
}
