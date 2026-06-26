import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchPageIntro } from "@/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { GallerySection } from "@/components/content/GallerySection";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "A visual glimpse of the Nirvana Yoga studio—light, texture, and quiet detail.",
};

export default async function GalleryPage() {
  const intro = await fetchPageIntro("gallery");

  return (
    <>
      <PageHeader {...intro} />
      <PageContent>
        <Suspense fallback={<ContentSkeleton layout="gallery" count={6} />}>
          <GallerySection />
        </Suspense>
      </PageContent>
    </>
  );
}
