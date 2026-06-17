import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AboutSectionShellProps = {
  sectionIndex: number;
  variant?: "default" | "experience-timeline" | "philosophy";
  children: ReactNode;
  className?: string;
};

/** Lightweight spacing wrapper for PageSection blocks rendered inside /about PageContent. */
export function AboutSectionShell({
  sectionIndex,
  variant,
  children,
  className,
}: AboutSectionShellProps) {
  return (
    <div
      className={cn(
        sectionIndex > 0 && variant !== "philosophy" && "mt-16",
        variant === "experience-timeline" && "border-t border-border/50 pt-16",
        variant === "philosophy" && sectionIndex > 0 && "mt-20",
        className,
      )}
    >
      {children}
    </div>
  );
}
