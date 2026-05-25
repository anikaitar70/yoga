/** Shared layout and form class tokens — single source for spacing and surfaces. */

export const sectionSpacing = {
  default: "py-16 sm:py-20",
  pageHero: "py-14 sm:py-20",
  loose: "py-16 sm:py-24",
} as const;

export const cardSurface =
  "border border-border bg-card" as const;

export const inputClassName =
  "w-full rounded-sm border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" as const;

export const eyebrowClassName =
  "text-xs font-semibold uppercase tracking-[0.2em] text-muted" as const;

export const proseClassName =
  "text-base leading-relaxed text-muted" as const;
