import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchPageIntro } from "@/content";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { BlogSection } from "@/components/content/BlogSection";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Essays on practice, creative life, and seasonal rhythms from Nirvana Yoga.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const intro = await fetchPageIntro("blog");

  return (
    <>
      <PageHeader {...intro} />
      <PageContent>
        <Suspense fallback={<ContentSkeleton layout="blog" count={3} />}>
          <BlogSection />
        </Suspense>
      </PageContent>
    </>
  );
}
