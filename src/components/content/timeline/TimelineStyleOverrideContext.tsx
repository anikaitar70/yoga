"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { TimelineStyleSettings } from "@/lib/timeline-style";

const TimelineStyleOverrideContext = createContext<TimelineStyleSettings | null>(null);

export function TimelineStyleOverrideProvider({
  style,
  children,
}: {
  style: TimelineStyleSettings | null;
  children: ReactNode;
}) {
  return (
    <TimelineStyleOverrideContext.Provider value={style}>{children}</TimelineStyleOverrideContext.Provider>
  );
}

export function useTimelineStyleOverride(): TimelineStyleSettings | null {
  return useContext(TimelineStyleOverrideContext);
}
