"use client";

import { cn } from "@/lib/utils";

/** Hero/section overlays replaced by site-wide scroll background. */
export function ProgramHeroDecoration({ className }: { className?: string }) {
  return <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden />;
}

export function ProgramSectionAccent(_props: { index?: number }) {
  return null;
}
