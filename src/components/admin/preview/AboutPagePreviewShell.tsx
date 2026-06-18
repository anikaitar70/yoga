import type { ReactNode } from "react";
import { PageContent } from "@/components/page/PageContent";
import { ProgramThemeProvider } from "@/components/program/ProgramThemeProvider";

/** Matches the live /about page content wrapper (PageHeader is omitted in preview). */
export function AboutPagePreviewShell({ children }: { children: ReactNode }) {
  return (
    <ProgramThemeProvider pageType="ABOUT">
      <div className="border-b border-border bg-background">
        <PageContent border="none" spacing="pageHero">
          {children}
        </PageContent>
      </div>
    </ProgramThemeProvider>
  );
}
