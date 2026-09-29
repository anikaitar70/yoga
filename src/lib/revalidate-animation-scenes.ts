import { revalidatePath } from "next/cache";
import { LOCALES } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/paths";
import type { PageType } from "@prisma/client";

// Kept for backwards-compat if any code still imports the tag (now unused since
// fetchRiverScene uses React cache, not unstable_cache — revalidation is via paths).
export const ANIMATION_SCENES_CACHE_TAG = "animation-scenes";

const PATH_BY_PAGE_TYPE: Partial<Record<PageType, string>> = {
  ABOUT: "/about",
  YOGA: "/yoga",
  HEALING: "/healing",
  JUST_ART_LIFE: "/just-art-life",
};

/** Invalidate the public page(s) a scene is assigned to (and the admin list). */
export function revalidateAnimationScenes(pageTypes: PageType[]): void {
  for (const pageType of pageTypes) {
    const path = PATH_BY_PAGE_TYPE[pageType];
    if (!path) continue;
    for (const locale of LOCALES) {
      const localized = localizedPath(path, locale);
      revalidatePath(localized, "page");
      revalidatePath(localized, "layout");
    }
    // Unlocalized path as well (proxy rewrites /ja/* internally).
    revalidatePath(path, "page");
    revalidatePath(path, "layout");
  }

  revalidatePath("/admin/animations", "page");
  revalidatePath("/admin", "layout");
}
