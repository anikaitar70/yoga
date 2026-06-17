"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PageType } from "@/lib/page-section-types";
import { getProgramTheme, type ProgramPageTheme } from "@/lib/program-page-themes";

const ProgramThemeContext = createContext<ProgramPageTheme | null>(null);

export function ProgramThemeProvider({
  pageType,
  children,
}: {
  pageType: PageType;
  children: ReactNode;
}) {
  const theme = getProgramTheme(pageType);
  return <ProgramThemeContext.Provider value={theme}>{children}</ProgramThemeContext.Provider>;
}

export function useProgramTheme() {
  const theme = useContext(ProgramThemeContext);
  return theme ?? getProgramTheme("YOGA");
}
