import type { Metadata } from "next";
import { Suspense } from "react";
import { pageIntros } from "@/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { YogaOfferingsSection } from "@/components/content/OfferingsSection";
import { Button } from "@/components/ui/Button";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

export const metadata: Metadata = {
  title: "Yoga",
  description:
    "Class styles at Nirvana Yoga—from gentle foundations to steady flow and deep rest.",
};

export default function YogaPage() {
  return (
    <>
      <PageHeader {...pageIntros.yoga} />
      <PageContent>
        <Suspense fallback={<ContentSkeleton layout="blog" count={3} />}>
          <YogaOfferingsSection />
        </Suspense>
        <div className="mt-14 flex flex-wrap justify-center gap-3">
          <Button href="/events">See workshops</Button>
          <Button href="/contact" variant="secondary">
            Ask a question
          </Button>
        </div>
      </PageContent>
    </>
  );
}
