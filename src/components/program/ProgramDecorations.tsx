"use client";

import { useProgramTheme } from "@/components/program/ProgramThemeProvider";
import { cn } from "@/lib/utils";

export function ProgramHeroDecoration({ className }: { className?: string }) {
  const theme = useProgramTheme();

  if (theme.motif === "geometric") {
    return (
      <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
        <svg className="absolute -right-8 top-12 h-64 w-64 text-accent/10" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="0.5" />
          <path d="M20 100h160M100 20v160" stroke="currentColor" strokeWidth="0.5" />
        </svg>
        <div className="absolute bottom-0 left-0 h-px w-2/3 bg-gradient-to-r from-accent/30 to-transparent" />
      </div>
    );
  }

  if (theme.motif === "organic") {
    return (
      <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
        <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-primary-soft/40 to-transparent" />
      </div>
    );
  }

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div className="absolute -left-6 top-20 h-40 w-32 rotate-6 rounded-lg border border-primary/15 bg-primary-soft/20" />
      <div className="absolute right-8 top-32 h-28 w-40 -rotate-3 rounded-lg border border-border/50 bg-card/40" />
      <div className="program-texture-overlay absolute inset-0 opacity-40" />
    </div>
  );
}

export function ProgramSectionAccent({ index }: { index?: number }) {
  const theme = useProgramTheme();
  const offset = (index ?? 0) % 2 === 0;

  if (theme.motif === "geometric") {
    return (
      <div
        className={cn(
          "pointer-events-none absolute h-24 w-24 border border-accent/15",
          offset ? "right-6 top-8" : "bottom-8 left-6",
        )}
        aria-hidden
      />
    );
  }

  if (theme.motif === "organic") {
    return (
      <div
        className={cn(
          "pointer-events-none absolute h-32 w-32 rounded-full bg-primary/5 blur-2xl",
          offset ? "right-0 top-0" : "bottom-0 left-0",
        )}
        aria-hidden
      />
    );
  }

  return null;
}
