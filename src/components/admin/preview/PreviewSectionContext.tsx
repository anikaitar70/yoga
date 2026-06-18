"use client";

import { createContext, useContext } from "react";

const PreviewSectionContext = createContext(false);

export function PreviewSectionProvider({
  children,
  active = true,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return <PreviewSectionContext.Provider value={active}>{children}</PreviewSectionContext.Provider>;
}

export function useInPreviewSection(): boolean {
  return useContext(PreviewSectionContext);
}
