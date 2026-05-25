import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";
import { pageIntros } from "@/content";

export default function GalleryLoading() {
  return (
    <>
      <PageHeader {...pageIntros.gallery} />
      <PageContent>
        <ContentSkeleton layout="gallery" count={6} />
      </PageContent>
    </>
  );
}
