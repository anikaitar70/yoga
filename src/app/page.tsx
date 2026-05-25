import { Suspense } from "react";
import { Hero } from "@/components/home/Hero";
import { AboutPreview } from "@/components/home/AboutPreview";
import { EventsPreview } from "@/components/home/EventsPreview";
import { PhilosophySection } from "@/components/home/PhilosophySection";
import { Testimonials } from "@/components/home/Testimonials";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

function HeroFallback() {
  return (
    <div
      className="border-b border-border"
      role="status"
      aria-label="Loading hero"
    >
      <div className="grid min-h-[min(85vh,720px)] lg:grid-cols-2">
        <div className="flex flex-col justify-center px-4 py-16 sm:px-6 lg:py-24">
          <div className="mx-auto w-full max-w-xl space-y-4">
            <div className="h-4 w-32 animate-pulse rounded-sm bg-border/60" />
            <div className="h-14 animate-pulse rounded-sm bg-border/60" />
            <div className="h-20 animate-pulse rounded-sm bg-border/60" />
          </div>
        </div>
        <div className="min-h-[280px] animate-pulse bg-border/40 lg:min-h-0" />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<HeroFallback />}>
        <Hero />
      </Suspense>
      <Suspense
        fallback={
          <ContentSkeleton
            layout="events"
            count={1}
            className="border-b border-border px-4 py-16 sm:px-6"
          />
        }
      >
        <AboutPreview />
      </Suspense>
      <Suspense
        fallback={
          <ContentSkeleton
            layout="events"
            count={2}
            className="border-b border-border bg-accent-soft/40 px-4 py-16 sm:px-6"
          />
        }
      >
        <EventsPreview />
      </Suspense>
      <Suspense
        fallback={
          <div
            className="border-b border-border px-4 py-16 sm:px-6"
            role="status"
            aria-label="Loading philosophy"
          >
            <div className="mx-auto max-w-3xl space-y-4">
              <div className="mx-auto h-10 w-48 animate-pulse rounded-sm bg-border/60" />
              <div className="h-24 animate-pulse rounded-sm bg-border/60" />
            </div>
          </div>
        }
      >
        <PhilosophySection />
      </Suspense>
      <Suspense
        fallback={
          <ContentSkeleton
            layout="testimonials"
            count={3}
            className="border-b border-border px-4 py-16 sm:px-6"
          />
        }
      >
        <Testimonials />
      </Suspense>
      <NewsletterSection />
    </>
  );
}
