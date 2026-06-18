import { revalidatePath } from "next/cache";
import { jaaLogoFromUnknown, logBrandingTrace } from "@/lib/branding-diagnostics";
import { parseSiteBranding, type BrandKey } from "@/lib/site-branding";
import { findSiteConfigRecord, patchSiteConfigBranding } from "@/lib/site-config-store";

const BRAND_KEYS = new Set<BrandKey>(["nirvanaYoga", "justArtAffaire"]);

export function isBrandKey(value: string): value is BrandKey {
  return BRAND_KEYS.has(value as BrandKey);
}

function revalidateBrandingPaths() {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    revalidatePath("/just-art-life");
  } catch (error) {
    logBrandingTrace("revalidate_failed", {
      reason: error instanceof Error ? error.message : String(error),
    });
  }
}

/** Write a branding logo URL to SiteConfig immediately after upload. */
export async function persistBrandingLogo(brand: BrandKey, logoSrc: string) {
  const existing = await findSiteConfigRecord();
  const branding = parseSiteBranding(existing?.branding ?? null);
  const next = {
    ...branding,
    [brand]: { ...branding[brand], logoSrc },
  };

  try {
    const result = await patchSiteConfigBranding(next);

    logBrandingTrace("upload_branding_persisted", {
      brand,
      logoSrc,
      configId: result.id,
      dbJaaLogo: jaaLogoFromUnknown(result.branding),
    });

    revalidateBrandingPaths();

    return { branding: parseSiteBranding(result.branding), configId: result.id };
  } catch (error) {
    logBrandingTrace("upload_branding_persist_failed", {
      brand,
      logoSrc,
      configId: existing?.id ?? null,
      reason: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}
