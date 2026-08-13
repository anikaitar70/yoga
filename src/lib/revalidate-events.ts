import { revalidatePath, revalidateTag } from "next/cache";
import { LOCALES } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/paths";
import { PUBLIC_EVENT_CATEGORY_PATHS } from "@/lib/seo/page-defaults";
import { specialEventPublicPath } from "@/lib/event-page-section";

export const EVENTS_CACHE_TAG = "events";

/** Invalidate cached event reads and all public routes that list events. */
export function revalidateEvents(options?: { specialEventSlug?: string }): void {
  revalidateTag(EVENTS_CACHE_TAG, "max");

  const pagePaths = new Set<string>([
    "/",
    "/events",
    "/yoga",
    "/healing",
    "/just-art-life",
    ...PUBLIC_EVENT_CATEGORY_PATHS,
  ]);

  if (options?.specialEventSlug) {
    pagePaths.add(specialEventPublicPath(options.specialEventSlug));
  }

  for (const path of pagePaths) {
    for (const locale of LOCALES) {
      revalidatePath(localizedPath(path, locale), "page");
    }
    revalidatePath(path, "layout");
  }

  revalidatePath("/admin/events", "page");
  revalidatePath("/admin/special-events", "page");
}
