import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";
import { pageIntros } from "@/content";

export default function BlogLoading() {
  return (
    <>
      <PageHeader {...pageIntros.blog} />
      <PageContent>
        <ContentSkeleton layout="blog" count={3} />
      </PageContent>
    </>
  );
}
