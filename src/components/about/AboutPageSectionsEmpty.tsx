import Link from "next/link";
import { Prose } from "@/components/ui/Prose";

export function AboutPageSectionsEmpty() {
  return (
    <div className="mt-10 border-t border-border/50 pt-10">
      <Prose>
        <p className="text-muted">
          Body content for this page is managed as sections. No published sections are configured yet.
        </p>
        <p>
          <Link
            href="/admin/pages?pageType=ABOUT"
            className="text-sm font-medium text-primary-muted underline-offset-4 hover:text-primary hover:underline"
          >
            Manage About page sections
          </Link>
        </p>
      </Prose>
    </div>
  );
}
