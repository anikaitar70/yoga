import { revalidatePath } from "next/cache";

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
export function revalidateBrandingPaths() {
  for (const path of PUBLIC_BRANDING_PATHS) {
    revalidatePath(path, "layout");
    revalidatePath(path, "page");
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/content", "page");
}
