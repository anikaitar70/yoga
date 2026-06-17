"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SectionLayoutSettings } from "@/lib/section-layout";

const LayoutOverrideContext = createContext<SectionLayoutSettings | null>(null);

export function LayoutOverrideProvider({
  layout,
  children,
}: {
  layout: SectionLayoutSettings | null;
  children: ReactNode;
}) {
  return <LayoutOverrideContext.Provider value={layout}>{children}</LayoutOverrideContext.Provider>;
}

export function useLayoutOverride() {
  return useContext(LayoutOverrideContext);
}
