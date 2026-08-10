import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchPageIntro, fetchEvents } from "@/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { EventsSection } from "@/components/content/EventsSection";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildStaticPageMetadata } from "@/lib/seo/build-static-metadata";
import { breadcrumbJsonLd, eventJsonLd, webPageJsonLd } from "@/lib/seo/structured-data";
import { getLocale } from "@/lib/i18n/server";
import { uiMessage } from "@/lib/i18n/resolve";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("events");
}

export default async function EventsPage() {
  const [intro, locale, events] = await Promise.all([
    fetchPageIntro("events"),
    getLocale(),
    fetchEvents(),
  ]);
  const homeLabel = uiMessage(locale, "home");

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: intro.title,
            description: intro.subtitle ?? intro.title,
            path: "/events",
            locale,
          }),
          breadcrumbJsonLd(
            [
              { label: homeLabel, href: "/" },
              { label: intro.title, href: "/events" },
            ],
            locale,
          ),
          ...events.slice(0, 20).map((event) => eventJsonLd(event, locale)),
        ]}
      />
      <PageHeader {...intro} titleAs="h1" />
      <PageContent>
        <Suspense fallback={<ContentSkeleton layout="events" count={2} />}>
          <EventsSection />
        </Suspense>
      </PageContent>
    </>
  );
}
