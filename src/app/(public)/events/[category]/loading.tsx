import { PageContent } from "@/components/page/PageContent";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

export default function EventCategoryLoading() {
  return (
    <>
      <div className="border-b border-border/50 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="skeleton-shimmer h-4 w-32 rounded-sm" />
          <div className="skeleton-shimmer h-12 w-2/3 max-w-md rounded-sm" />
          <div className="skeleton-shimmer h-16 w-full rounded-sm" />
        </div>
      </div>
      <PageContent>
        <ContentSkeleton layout="events" count={4} />
      </PageContent>
    </>
  );
}
