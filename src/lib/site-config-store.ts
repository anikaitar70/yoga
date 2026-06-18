import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logBrandingTrace } from "@/lib/branding-diagnostics";
import type { SiteBranding } from "@/lib/site-branding";

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

function brandingToJson(branding: SiteBranding): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(branding)) as Prisma.InputJsonValue;
}

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

/** Branding-only write — avoids upsert/dedupe complexity during logo upload. */
export async function patchSiteConfigBranding(branding: SiteBranding): Promise<SiteConfigRecord> {
  const brandingJson = brandingToJson(branding);
  const existing = await prisma.siteConfig.findUnique({ where: { id: SITE_CONFIG_ID } });

  try {
    if (existing) {
      return await prisma.siteConfig.update({
        where: { id: SITE_CONFIG_ID },
        data: { branding: brandingJson },
      });
    }

    return await prisma.siteConfig.create({
      data: {
        ...DEFAULT_SITE_CONFIG_CREATE,
        branding: brandingJson,
      },
    });
  } catch (error) {
    logBrandingTrace("patch_branding_prisma_failed", {
      reason: error instanceof Error ? error.message : String(error),
    });

    const jsonText = JSON.stringify(branding);
    const updated = await prisma.$executeRaw`
      UPDATE "SiteConfig"
      SET branding = ${jsonText}::jsonb, "updatedAt" = NOW()
      WHERE id = ${SITE_CONFIG_ID}
    `;

    if (Number(updated) === 0) {
      await prisma.$executeRaw`
        INSERT INTO "SiteConfig" (
          id,
          name,
          tagline,
          "contactEmail",
          "contactPhone",
          "contactAddress",
          social,
          branding,
          "createdAt",
          "updatedAt"
        ) VALUES (
          ${SITE_CONFIG_ID},
          ${"Nirvana Yoga"},
          ${"Rooted in tradition. Guided by presence."},
          ${"hello@nirvanayoga.studio"},
          ${""},
          ${"Japan"},
          ${JSON.stringify(DEFAULT_SITE_CONFIG_CREATE.social)}::jsonb,
          ${jsonText}::jsonb,
          NOW(),
          NOW()
        )
      `;
    }

    const row = await prisma.siteConfig.findUnique({ where: { id: SITE_CONFIG_ID } });
    if (!row) {
      throw error;
    }

    logBrandingTrace("patch_branding_sql_fallback_ok", { configId: row.id });
    return row;
  }
}

export async function updateSiteConfigRecord(
  data: Prisma.SiteConfigUpdateInput,
): Promise<SiteConfigRecord> {
  const brandingOnly =
    data.branding !== undefined &&
    Object.keys(data).length === 1;

  if (brandingOnly && data.branding && typeof data.branding === "object") {
    return patchSiteConfigBranding(data.branding as SiteBranding);
  }

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

  return result;
}
