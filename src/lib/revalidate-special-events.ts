import { revalidatePath } from "next/cache";
import { revalidateEvents } from "@/lib/revalidate-events";
import { LOCALES } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/paths";
import { specialEventPublicPath } from "@/lib/event-page-section";

/** Invalidate cached special event pages after CMS mutations. */
export function revalidateSpecialEvent(slug: string): void {
  revalidateEvents({ specialEventSlug: slug });
  const path = specialEventPublicPath(slug);
  for (const locale of LOCALES) {
    revalidatePath(localizedPath(path, locale), "page");
  }
  revalidatePath("/admin/special-events", "page");
}
