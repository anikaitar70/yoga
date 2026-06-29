import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripLocalePrefix } from "@/lib/i18n/locale";
import { shouldShowTranslationDisclaimer } from "@/lib/i18n/translation-review";
import type { Locale } from "@/lib/i18n/locale";
import { isLocale } from "@/lib/i18n/locale";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPath = searchParams.get("path") ?? "/";
  const localeParam = searchParams.get("locale") ?? "en";
  const locale: Locale = isLocale(localeParam) ? localeParam : "en";

  const path = stripLocalePrefix(rawPath.startsWith("/") ? rawPath : `/${rawPath}`);

  let pageStatus: "MACHINE" | "HUMAN_REVIEWED" | undefined;

  const blogMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    try {
      const post = await prisma.blogPost.findUnique({
        where: { slug: blogMatch[1] },
        select: { jaTranslationStatus: true, published: true },
      });
      if (post?.published) {
        pageStatus = post.jaTranslationStatus;
      }
    } catch {
      // ignore
    }
  } else {
    try {
      const pageSeo = await prisma.pageSeo.findUnique({
        where: { path: path === "" ? "/" : path },
        select: { jaTranslationStatus: true },
      });
      pageStatus = pageSeo?.jaTranslationStatus;
    } catch {
      // ignore
    }
  }

  const show = shouldShowTranslationDisclaimer(locale, pageStatus);

  return NextResponse.json(
    { show, pageStatus: pageStatus ?? "MACHINE" },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
