import { Suspense } from "react";
import type { Metadata } from "next";
import { HomepageLayoutShell } from "@/components/home/HomepageLayoutShell";
import { Hero } from "@/components/home/Hero";
import { AboutPreview } from "@/components/home/AboutPreview";
import { PhilosophySection } from "@/components/home/PhilosophySection";
import { ProgramPathways } from "@/components/home/ProgramPathways";
import { FeaturedEventsSection } from "@/components/home/FeaturedEventsSection";
import { RetreatsPreview } from "@/components/home/RetreatsPreview";
import { HomeGalleryPreview } from "@/components/home/HomeGalleryPreview";
import { Testimonials } from "@/components/home/Testimonials";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ContactPreview } from "@/components/home/ContactPreview";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";
import { buildStaticPageMetadata } from "@/lib/seo/build-static-metadata";
import { getLocale } from "@/lib/i18n/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { webPageJsonLd } from "@/lib/seo/structured-data";
import { getStaticPageDefaults } from "@/lib/seo/page-defaults";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("home");
}

function HeroFallback() {
  return (
    <div className="border-b border-border/50" role="status" aria-label="Loading hero">
      <div className="grid min-h-[min(90vh,820px)] lg:grid-cols-2">
        <div className="flex flex-col justify-center px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto w-full max-w-xl space-y-5">
            <div className="h-4 w-32 animate-pulse rounded-md bg-border/60" />
            <div className="h-16 animate-pulse rounded-md bg-border/60" />
            <div className="h-20 animate-pulse rounded-md bg-border/60" />
          </div>
        </div>
        <div className="min-h-[320px] animate-pulse bg-border/30 lg:min-h-0" />
      </div>
    </div>
  );
}

export default async function HomePage() {
  const locale = await getLocale();
  const defaults = getStaticPageDefaults("home", locale);

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          name: defaults.title,
          description: defaults.description,
          path: "/",
          locale,
        })}
      />
      <HomepageLayoutShell>
      <Suspense fallback={<HeroFallback />}>
        <Hero />
      </Suspense>
      <Suspense
        fallback={
          <ContentSkeleton layout="events" count={1} className="border-b border-border/50 px-4 py-20 sm:px-6" />
        }
      >
        <AboutPreview />
      </Suspense>
      <Suspense
        fallback={
          <div className="border-b border-border/50 px-4 py-20 sm:px-6" role="status" aria-label="Loading philosophy">
            <div className="mx-auto max-w-3xl space-y-5">
              <div className="mx-auto h-12 w-56 animate-pulse rounded-md bg-border/60" />
              <div className="h-28 animate-pulse rounded-md bg-border/60" />
            </div>
          </div>
        }
      >
        <PhilosophySection />
      </Suspense>
      <Suspense fallback={<ContentSkeleton layout="events" count={2} className="border-b border-border/50 px-4 py-20 sm:px-6" />}>
        <ProgramPathways />
      </Suspense>
      <Suspense fallback={<ContentSkeleton layout="events" count={2} className="border-b border-border/50 px-4 py-20 sm:px-6" />}>
        <FeaturedEventsSection />
      </Suspense>
      <Suspense
        fallback={
          <ContentSkeleton layout="events" count={2} className="border-b border-border/50 px-4 py-20 sm:px-6" />
        }
      >
        <RetreatsPreview />
      </Suspense>
      <Suspense
        fallback={
          <ContentSkeleton layout="gallery" count={4} className="border-b border-border/50 px-4 py-20 sm:px-6" />
        }
      >
        <HomeGalleryPreview />
      </Suspense>
      <Suspense
        fallback={
          <ContentSkeleton
            layout="testimonials"
            count={3}
            className="border-b border-border/50 px-4 py-20 sm:px-6"
          />
        }
      >
        <Testimonials />
      </Suspense>
      <Suspense
        fallback={
          <div className="border-b border-border/50 px-4 py-16 sm:px-6" role="status" aria-label="Loading newsletter">
            <div className="mx-auto max-w-xl space-y-4">
              <div className="h-8 w-48 animate-pulse rounded-md bg-border/60" />
              <div className="h-12 animate-pulse rounded-md bg-border/60" />
            </div>
          </div>
        }
      >
        <NewsletterSection />
      </Suspense>
      <Suspense
        fallback={
          <div className="px-4 py-16 sm:px-6" role="status" aria-label="Loading contact">
            <div className="mx-auto max-w-xl space-y-4">
              <div className="h-8 w-40 animate-pulse rounded-md bg-border/60" />
              <div className="h-24 animate-pulse rounded-md bg-border/60" />
            </div>
          </div>
        }
      >
        <ContactPreview />
      </Suspense>
    </HomepageLayoutShell>
    </>
  );
}
