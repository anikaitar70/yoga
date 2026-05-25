import type { Metadata } from "next";
import { Suspense } from "react";
import { pageIntros } from "@/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { HealingSection } from "@/components/content/HealingSection";
import { Button } from "@/components/ui/Button";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

export const metadata: Metadata = {
  title: "Healing",
  description:
    "Supportive modalities offered at Nirvana Yoga—always complementary to your wider care team.",
};

export default function HealingPage() {
  return (
    <>
      <PageHeader {...pageIntros.healing} />
      <PageContent>
        <Suspense
          fallback={
            <div className="mx-auto max-w-3xl space-y-10">
              <ContentSkeleton layout="events" count={3} />
            </div>
          }
        >
          <HealingSection />
        </Suspense>
        <div className="mt-14 text-center">
          <Button href="/contact" variant="secondary">
            Ask about healing pathways
          </Button>
        </div>
      </PageContent>
    </>
  );
}
