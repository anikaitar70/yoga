import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchPageIntro } from "@/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { EventsSection } from "@/components/content/EventsSection";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";
import { buildStaticPageMetadata } from "@/lib/seo/build-static-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("events");
}

export default async function EventsPage() {
  const intro = await fetchPageIntro("events");

  return (
    <>
      <PageHeader {...intro} titleAs="h1" />
      <PageContent>
        <Suspense fallback={<ContentSkeleton layout="events" count={2} />}>
          <EventsSection />
        </Suspense>
      </PageContent>
    </>
  );
}
