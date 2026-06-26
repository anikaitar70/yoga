import { revalidatePath, revalidateTag } from "next/cache";

/** Public routes whose shared `(public)` layout embeds BrandingProvider. */
const PUBLIC_BRANDING_PATHS = [
  "/",
  "/just-art-life",
  "/yoga",
  "/healing",
  "/about",
  "/contact",
  "/gallery",
  "/events",
  "/blog",
] as const;

/** Bust cached layouts/pages after branding logo or scale changes. */
export function revalidateBrandingPaths(): void {
  revalidateTag("site-config", "max");
  revalidateTag("hero", "max");
  revalidateTag("gallery", "max");

  for (const path of PUBLIC_BRANDING_PATHS) {
    revalidatePath(path, "layout");
    revalidatePath(path, "page");
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/content", "page");
}

/** Alias for gallery, hero, and other CMS media saves that affect public pages. */
export const revalidateCmsContentPaths = revalidateBrandingPaths;
