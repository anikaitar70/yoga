import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { SectionLayoutSettings } from "@/lib/section-layout";
import { resolveSectionBackgroundStyle } from "@/components/content/SectionBackground";

type AboutSectionShellProps = {
  sectionIndex: number;
  variant?: "default" | "experience-timeline" | "philosophy";
  children: ReactNode;
  className?: string;
  layout?: SectionLayoutSettings | null;
};

/** Lightweight spacing wrapper for PageSection blocks rendered inside /about PageContent. */
export function AboutSectionShell({
  sectionIndex,
  variant,
  children,
  className,
  layout,
}: AboutSectionShellProps) {
  const bgStyle = resolveSectionBackgroundStyle(layout?.sectionBackground);
  return (
    <div
      className={cn(
        sectionIndex > 0 && variant !== "philosophy" && "mt-16",
        variant === "experience-timeline" && "border-t border-border/50 pt-16",
        variant === "philosophy" && sectionIndex > 0 && "mt-20",
        className,
      )}
      style={bgStyle}
    >
      {children}
    </div>
  );
}
