import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchPageIntro } from "@/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { GallerySection } from "@/components/content/GallerySection";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";
import { buildStaticPageMetadata } from "@/lib/seo/build-static-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildStaticPageMetadata("gallery");
}

export default async function GalleryPage() {
  const intro = await fetchPageIntro("gallery");

  return (
    <>
      <PageHeader {...intro} titleAs="h1" />
      <PageContent>
        <Suspense fallback={<ContentSkeleton layout="gallery" count={6} />}>
          <GallerySection />
        </Suspense>
      </PageContent>
    </>
  );
}
