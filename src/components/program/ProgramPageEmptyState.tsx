import Link from "next/link";
import { PAGE_TYPE_LABELS, type PageType } from "@/lib/page-section-types";
import { Container } from "@/components/ui/Container";

type ProgramPageEmptyStateProps = {
  pageType: PageType;
};

export function ProgramPageEmptyState({ pageType }: ProgramPageEmptyStateProps) {
  const label = PAGE_TYPE_LABELS[pageType];

  return (
    <section className="border-b border-border/40 py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-medium text-muted">{label}</p>
          <h1 className="mt-3 font-display text-2xl text-foreground sm:text-3xl">Page content coming soon</h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            No published sections are configured for this page yet. Add sections in the admin to replace this
            placeholder.
          </p>
          <Link
            href={`/admin/pages?pageType=${pageType}`}
            className="mt-8 inline-flex text-sm font-medium text-primary-muted underline-offset-4 hover:text-primary hover:underline"
          >
            Manage {label} sections
          </Link>
        </div>
      </Container>
    </section>
  );
}
