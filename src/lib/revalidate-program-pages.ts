import { revalidatePath } from "next/cache";
import type { PageType } from "@/lib/page-section-types";

const PATH_BY_PAGE_TYPE: Record<PageType, string> = {
  YOGA: "/yoga",
  HEALING: "/healing",
  JUST_ART_LIFE: "/just-art-life",
  ABOUT: "/about",
};

/** Invalidate cached program pages after CMS section mutations. */
export function revalidateProgramPage(pageType: PageType) {
  const path = PATH_BY_PAGE_TYPE[pageType];
  revalidatePath(path, "page");
  revalidatePath("/admin/pages", "page");
}
