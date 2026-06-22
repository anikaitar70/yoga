import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logBrandingTrace } from "@/lib/branding-diagnostics";
import type { SiteBranding } from "@/lib/site-branding";

/** Single SiteConfig row — must match prisma/seed.js and consolidate-site-config.sh */
export const SITE_CONFIG_ID = "main";

type SiteConfigRecord = Prisma.SiteConfigGetPayload<Record<string, never>> & {
  designSettings?: unknown;
  designSettingsByPage?: unknown;
};

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

const DESIGN_SETTINGS_COLUMNS = ["designSettings", "designSettingsByPage"] as const;

function jsonForDb(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function brandingToJson(branding: SiteBranding): Prisma.InputJsonValue {
  return jsonForDb(branding);
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

function isUnknownArgumentField(error: unknown, field: string): boolean {
  return (
    error instanceof Prisma.PrismaClientValidationError &&
    (error.message.includes(`Unknown argument \`${field}\``) ||
      error.message.includes(`Unknown field \`${field}\``))
  );
}

function isOptionalSiteConfigFieldError(error: unknown, field: string): boolean {
  return isUnknownSelectField(error, field) || isMissingSiteConfigColumn(error, field);
}

async function readDesignSettingsColumnsViaSql(): Promise<{
  designSettings: unknown;
  designSettingsByPage: unknown;
}> {
  const rows = await prisma.$queryRaw<
    Array<{ designSettings: unknown; designSettingsByPage: unknown }>
  >`
    SELECT "designSettings", "designSettingsByPage"
    FROM "SiteConfig"
    WHERE id = ${SITE_CONFIG_ID}
  `;

  return {
    designSettings: rows[0]?.designSettings ?? null,
    designSettingsByPage: rows[0]?.designSettingsByPage ?? null,
  };
}

async function patchDesignSettingsColumns(
  designSettings: unknown | undefined,
  designSettingsByPage: unknown | undefined,
): Promise<void> {
  if (designSettings === undefined && designSettingsByPage === undefined) {
    return;
  }

  const designSettingsJson =
    designSettings !== undefined ? JSON.stringify(designSettings) : null;
  const designSettingsByPageJson =
    designSettingsByPage !== undefined ? JSON.stringify(designSettingsByPage) : null;

  if (designSettings !== undefined && designSettingsByPage !== undefined) {
    await prisma.$executeRaw`
      UPDATE "SiteConfig"
      SET
        "designSettings" = ${designSettingsJson}::jsonb,
        "designSettingsByPage" = ${designSettingsByPageJson}::jsonb,
        "updatedAt" = NOW()
      WHERE id = ${SITE_CONFIG_ID}
    `;
    return;
  }

  if (designSettings !== undefined) {
    await prisma.$executeRaw`
      UPDATE "SiteConfig"
      SET "designSettings" = ${designSettingsJson}::jsonb, "updatedAt" = NOW()
      WHERE id = ${SITE_CONFIG_ID}
    `;
  }

  if (designSettingsByPage !== undefined) {
    await prisma.$executeRaw`
      UPDATE "SiteConfig"
      SET "designSettingsByPage" = ${designSettingsByPageJson}::jsonb, "updatedAt" = NOW()
      WHERE id = ${SITE_CONFIG_ID}
    `;
  }
}

function splitDesignSettingsFromUpdate(
  data: Prisma.SiteConfigUpdateInput,
): {
  prismaData: Prisma.SiteConfigUpdateInput;
  designSettings?: unknown;
  designSettingsByPage?: unknown;
} {
  const record = { ...(data as Record<string, unknown>) };
  const designSettings = record.designSettings;
  const designSettingsByPage = record.designSettingsByPage;
  delete record.designSettings;
  delete record.designSettingsByPage;

  return {
    prismaData: record as Prisma.SiteConfigUpdateInput,
    designSettings,
    designSettingsByPage,
  };
}

async function loadSiteConfigRecord(): Promise<SiteConfigRecord | null> {
  let includeNavigation = true;
  let includeHomepageLayout = true;
  let includeHomepageSections = true;
  let includeTimelineStyles = true;
  let includeBranding = true;
  let includeDesignSettings = true;
  let includeDesignSettingsByPage = true;

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
    if (includeDesignSettings) select.designSettings = true;
    if (includeDesignSettingsByPage) select.designSettingsByPage = true;

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

      const loaded = row as unknown as SiteConfigRecord | null;
      if (!loaded) return null;

      const needsSqlDesign =
        (!includeDesignSettings || !includeDesignSettingsByPage) &&
        (includeDesignSettings || includeDesignSettingsByPage);

      if (needsSqlDesign) {
        try {
          const design = await readDesignSettingsColumnsViaSql();
          if (!includeDesignSettings) {
            loaded.designSettings = design.designSettings as SiteConfigRecord["designSettings"];
          }
          if (!includeDesignSettingsByPage) {
            loaded.designSettingsByPage =
              design.designSettingsByPage as SiteConfigRecord["designSettingsByPage"];
          }
        } catch (error) {
          logBrandingTrace("site_config_design_sql_read_failed", {
            reason: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return loaded;
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
      if (includeDesignSettings && isOptionalSiteConfigFieldError(error, "designSettings")) {
        includeDesignSettings = false;
        continue;
      }
      if (
        includeDesignSettingsByPage &&
        isOptionalSiteConfigFieldError(error, "designSettingsByPage")
      ) {
        includeDesignSettingsByPage = false;
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
    data.branding !== undefined && Object.keys(data).length === 1;

  if (brandingOnly && data.branding && typeof data.branding === "object") {
    return patchSiteConfigBranding(data.branding as SiteBranding);
  }

  const { prismaData, designSettings, designSettingsByPage } = splitDesignSettingsFromUpdate(data);
  const hasDesignColumns =
    designSettings !== undefined || designSettingsByPage !== undefined;

  let result: SiteConfigRecord;

  try {
    result = await prisma.siteConfig.upsert({
      where: { id: SITE_CONFIG_ID },
      create: {
        ...DEFAULT_SITE_CONFIG_CREATE,
        ...(prismaData as Prisma.SiteConfigCreateInput),
      },
      update: prismaData,
    });
  } catch (error) {
    const unsupportedDesignField = DESIGN_SETTINGS_COLUMNS.find((field) =>
      isUnknownArgumentField(error, field),
    );

    if (!unsupportedDesignField) {
      throw error;
    }

    logBrandingTrace("site_config_prisma_upsert_stripped_design", {
      reason: error instanceof Error ? error.message : String(error),
      strippedField: unsupportedDesignField,
    });

    result = await prisma.siteConfig.upsert({
      where: { id: SITE_CONFIG_ID },
      create: {
        ...DEFAULT_SITE_CONFIG_CREATE,
        ...(prismaData as Prisma.SiteConfigCreateInput),
      },
      update: prismaData,
    });
  }

  if (hasDesignColumns) {
    await patchDesignSettingsColumns(
      designSettings !== undefined ? jsonForDb(designSettings) : undefined,
      designSettingsByPage !== undefined ? jsonForDb(designSettingsByPage) : undefined,
    );
  }

  const removed = await prisma.siteConfig.deleteMany({
    where: { id: { not: SITE_CONFIG_ID } },
  });

  if (removed.count > 0) {
    logBrandingTrace("site_config_dedupe", { removedRows: removed.count });
  }

  const refreshed = await findSiteConfigRecord();
  return refreshed ?? result;
}
