import type { Metadata } from "next";
import { Suspense, ReactNode } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";
import { fetchEventsByCategory } from "@/content/repositories/events";
import { EventList } from "@/components/content/EventList";
import { fetchPageSeo } from "@/content/repositories/page-seo";
import { getLocale } from "@/lib/i18n/server";
import { fetchSite } from "@/content";
import { buildPageMetadata, mergeSeoDefaults } from "@/lib/seo/metadata";
import { DEFAULT_LOGO_SRC } from "@/lib/site-branding";
import { EVENT_CATEGORY_SEO } from "@/lib/seo/page-defaults";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, eventJsonLd, webPageJsonLd } from "@/lib/seo/structured-data";
import { uiMessage } from "@/lib/i18n/resolve";

interface Params {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  const meta = EVENT_CATEGORY_SEO[category];
  if (!meta) return { title: "Not Found", robots: { index: false, follow: false } };

  const [locale, site, pageSeo] = await Promise.all([
    getLocale(),
    fetchSite(),
    fetchPageSeo(meta.path),
  ]);

  const merged = mergeSeoDefaults(
    { title: meta.title, description: meta.description },
    pageSeo,
  );

  return buildPageMetadata(
    {
      title: merged.title,
      description: merged.description,
      path: meta.path,
      ogImage: merged.ogImage,
      keywords: merged.keywords,
      canonicalOverride: merged.canonicalOverride,
    },
    locale,
    site.name,
    site.branding.nirvanaYoga.logoSrc || DEFAULT_LOGO_SRC.nirvanaYoga,
  );
}

async function CategoryEventsSection({
  category,
}: {
  category: string;
}): Promise<ReactNode> {
  const events = await fetchEventsByCategory(category);
  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-slate-600">No events in this category yet.</p>
      </div>
    );
  }
  return <EventList events={events} />;
}

export default async function CategoryEventsPage({ params }: Params) {
  const { category } = await params;
  const meta = EVENT_CATEGORY_SEO[category];

  if (!meta) {
    notFound();
  }

  const locale = await getLocale();
  const homeLabel = uiMessage(locale, "home");
  const events = await fetchEventsByCategory(category);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: meta.title,
            description: meta.description,
            path: meta.path,
            locale,
          }),
          breadcrumbJsonLd(
            [
              { label: homeLabel, href: "/" },
              { label: uiMessage(locale, "events"), href: "/events" },
              { label: meta.title, href: meta.path },
            ],
            locale,
          ),
          ...events.slice(0, 10).map((event) => eventJsonLd(event, locale)),
        ]}
      />
      <PageHeader title={meta.title} subtitle={meta.subtitle} titleAs="h1" />
      <PageContent>
        <Suspense fallback={<ContentSkeleton layout="events" count={2} />}>
          <CategoryEventsSection category={category} />
        </Suspense>
      </PageContent>
    </>
  );
}
