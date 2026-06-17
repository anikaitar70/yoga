"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  TimelineStyleOverrideProvider,
  useTimelineStyleOverride,
} from "@/components/content/timeline/TimelineStyleOverrideContext";
import {
  mergeTimelineStyle,
  timelineStyleToCssVariables,
  type TimelineStyleSettings,
} from "@/lib/timeline-style";
import { cn } from "@/lib/utils";

type TimelineStyleShellProps = {
  style?: TimelineStyleSettings | null;
  className?: string;
  children: ReactNode;
};

export function TimelineStyleShell({ style, className, children }: TimelineStyleShellProps) {
  const override = useTimelineStyleOverride();
  const resolved = mergeTimelineStyle(style, override);
  const cssVars = timelineStyleToCssVariables(resolved) as CSSProperties;

  return (
    <div className={cn("timeline-styled", className)} style={cssVars}>
      {children}
    </div>
  );
}

export function TimelineStyleShellProvider({
  override,
  children,
}: {
  override: TimelineStyleSettings | null;
  children: ReactNode;
}) {
  return <TimelineStyleOverrideProvider style={override}>{children}</TimelineStyleOverrideProvider>;
}

export { timelineStyleToCssVariables };
