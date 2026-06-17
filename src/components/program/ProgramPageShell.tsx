"use client";

import type { ReactNode } from "react";
import type { PageType } from "@/lib/page-section-types";
import { ProgramThemeProvider } from "@/components/program/ProgramThemeProvider";
import { useProgramTheme } from "@/components/program/ProgramThemeProvider";
import { cn } from "@/lib/utils";

function ProgramPageInner({ children }: { children: ReactNode }) {
  const theme = useProgramTheme();
  return <div className={cn("program-page", theme.shellClass)}>{children}</div>;
}

export function ProgramPageShell({
  pageType,
  children,
}: {
  pageType: PageType;
  children: ReactNode;
}) {
  return (
    <ProgramThemeProvider pageType={pageType}>
      <ProgramPageInner>{children}</ProgramPageInner>
    </ProgramThemeProvider>
  );
}
