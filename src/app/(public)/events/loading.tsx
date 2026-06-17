import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";
import { pageIntros } from "@/content";

export default function EventsLoading() {
  return (
    <>
      <PageHeader {...pageIntros.events} />
      <PageContent>
        <ContentSkeleton layout="events" count={2} />
      </PageContent>
    </>
  );
}
