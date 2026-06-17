import type { Metadata } from "next";
import { Suspense } from "react";
import { pageIntros } from "@/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { GallerySection } from "@/components/content/GallerySection";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "A visual glimpse of the Nirvana Yoga studio—light, texture, and quiet detail.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHeader {...pageIntros.gallery} />
      <PageContent>
        <Suspense fallback={<ContentSkeleton layout="gallery" count={6} />}>
          <GallerySection />
        </Suspense>
      </PageContent>
    </>
  );
}
