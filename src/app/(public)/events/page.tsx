import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchPageIntro } from "@/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { EventsSection } from "@/components/content/EventsSection";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Workshops, immersions, and gatherings at Nirvana Yoga—dates, locations, and how to join.",
};

export default async function EventsPage() {
  const intro = await fetchPageIntro("events");

  return (
    <>
      <PageHeader {...intro} />
      <PageContent>
        <Suspense fallback={<ContentSkeleton layout="events" count={2} />}>
          <EventsSection />
        </Suspense>
      </PageContent>
    </>
  );
}
