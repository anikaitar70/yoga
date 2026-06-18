import { revalidatePath } from "next/cache";
import { jaaLogoFromUnknown, logBrandingTrace } from "@/lib/branding-diagnostics";
import { parseSiteBranding, type BrandKey } from "@/lib/site-branding";
import { findSiteConfigRecord, updateSiteConfigRecord } from "@/lib/site-config-store";

const BRAND_KEYS = new Set<BrandKey>(["nirvanaYoga", "justArtAffaire"]);

export function isBrandKey(value: string): value is BrandKey {
  return BRAND_KEYS.has(value as BrandKey);
}

/** Write a branding logo URL to SiteConfig immediately after upload. */
export async function persistBrandingLogo(brand: BrandKey, logoSrc: string) {
  const existing = await findSiteConfigRecord();
  const branding = parseSiteBranding(existing?.branding ?? null);
  const next = {
    ...branding,
    [brand]: { ...branding[brand], logoSrc },
  };

  const result = await updateSiteConfigRecord({ branding: next });

  logBrandingTrace("upload_branding_persisted", {
    brand,
    logoSrc,
    configId: result.id,
    dbJaaLogo: jaaLogoFromUnknown(result.branding),
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/just-art-life");

  return { branding: parseSiteBranding(result.branding), configId: result.id };
}
