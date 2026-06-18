import { Prisma } from "@prisma/client";
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

const siteConfigCoreSelect = {
  id: true,
  name: true,
  tagline: true,
  contactEmail: true,
  contactPhone: true,
  contactAddress: true,
  social: true,
  createdAt: true,
  updatedAt: true,
} as const;

const brandingSelect = {
  id: true,
  branding: true,
  updatedAt: true,
} as const;

function brandingToJson(branding: SiteBranding): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(branding)) as Prisma.InputJsonValue;
}

function isMissingSiteConfigColumn(error: unknown, column: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2022") {
    return false;
  }
  const meta = error.meta as { column?: string; column_name?: string } | undefined;
  const missing = meta?.column ?? meta?.column_name;
  return missing === column || missing === `SiteConfig.${column}`;
}

function isUnknownSelectField(error: unknown, field: string): boolean {
  return (
    error instanceof Prisma.PrismaClientValidationError &&
    error.message.includes(`Unknown field \`${field}\``)
  );
}

function isOptionalSiteConfigFieldError(error: unknown, field: string): boolean {
  return isUnknownSelectField(error, field) || isMissingSiteConfigColumn(error, field);
}

async function loadSiteConfigRecord(): Promise<SiteConfigRecord | null> {
  let includeNavigation = true;
  let includeHomepageLayout = true;
  let includeHomepageSections = true;
  let includeTimelineStyles = true;
  let includeBranding = true;

  while (true) {
    const select: Record<string, true> = { ...siteConfigCoreSelect };
    if (includeNavigation) select.navigation = true;
    if (includeBranding) select.branding = true;
    if (includeHomepageLayout) select.homepageLayout = true;
    if (includeHomepageSections) select.homepageSections = true;
    if (includeTimelineStyles) {
      select.timelineStyleDefaults = true;
      select.timelineStyleByPage = true;
    }

    try {
      let row = await prisma.siteConfig.findUnique({
        where: { id: SITE_CONFIG_ID },
        select,
      });

      if (!row) {
        row = await prisma.siteConfig.findFirst({
          orderBy: { updatedAt: "desc" },
          select,
        });
        if (row) {
          logBrandingTrace("site_config_fallback_read", {
            legacyId: row.id,
            reason: "canonical row missing",
          });
        }
      }

      return row as SiteConfigRecord | null;
    } catch (error) {
      if (includeNavigation && isOptionalSiteConfigFieldError(error, "navigation")) {
        includeNavigation = false;
        continue;
      }
      if (includeBranding && isOptionalSiteConfigFieldError(error, "branding")) {
        includeBranding = false;
        continue;
      }
      if (includeHomepageSections && isOptionalSiteConfigFieldError(error, "homepageSections")) {
        includeHomepageSections = false;
        continue;
      }
      if (includeHomepageLayout && isOptionalSiteConfigFieldError(error, "homepageLayout")) {
        includeHomepageLayout = false;
        continue;
      }
      if (includeTimelineStyles && isOptionalSiteConfigFieldError(error, "timelineStyleDefaults")) {
        includeTimelineStyles = false;
        continue;
      }
      if (includeTimelineStyles && isOptionalSiteConfigFieldError(error, "timelineStyleByPage")) {
        includeTimelineStyles = false;
        continue;
      }
      throw error;
    }
  }
}

async function readBrandingRowAfterSqlFallback(): Promise<SiteConfigRecord> {
  const rows = await prisma.$queryRaw<
    Array<{ id: string; branding: unknown; updatedAt: Date }>
  >`SELECT id, branding, "updatedAt" FROM "SiteConfig" WHERE id = ${SITE_CONFIG_ID}`;

  const row = rows[0];
  if (!row) {
    throw new Error("SiteConfig row missing after SQL branding fallback.");
  }

  return {
    id: row.id,
    branding: row.branding as SiteConfigRecord["branding"],
    updatedAt: row.updatedAt,
  } as SiteConfigRecord;
}

export async function findSiteConfigRecord(): Promise<SiteConfigRecord | null> {
  return loadSiteConfigRecord();
}

/** Branding-only write — avoids upsert/dedupe complexity during logo upload. */
export async function patchSiteConfigBranding(branding: SiteBranding): Promise<SiteConfigRecord> {
  const brandingJson = brandingToJson(branding);
  let existing: { id: string } | null = null;

  try {
    existing = await prisma.siteConfig.findUnique({
      where: { id: SITE_CONFIG_ID },
      select: { id: true },
    });
  } catch (error) {
    if (!isOptionalSiteConfigFieldError(error, "branding")) {
      throw error;
    }
  }

  try {
    if (existing) {
      const updated = await prisma.siteConfig.update({
        where: { id: SITE_CONFIG_ID },
        data: { branding: brandingJson },
        select: brandingSelect,
      });
      return updated as SiteConfigRecord;
    }

    const created = await prisma.siteConfig.create({
      data: {
        ...DEFAULT_SITE_CONFIG_CREATE,
        branding: brandingJson,
      },
      select: brandingSelect,
    });
    return created as SiteConfigRecord;
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

    const row = await readBrandingRowAfterSqlFallback();
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
