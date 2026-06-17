/** Shared layout and form class tokens — single source for spacing and surfaces. */

export const sectionSpacing = {
  none: "",
  default: "py-20 sm:py-28",
  pageHero: "py-16 sm:py-24 lg:py-28",
  loose: "py-24 sm:py-32",
  immersive: "py-28 sm:py-36",
} as const;

export const cardSurface =
  "rounded-lg border border-border/80 bg-card shadow-[0_1px_3px_rgba(42,36,31,0.04)]" as const;

export const cardSurfaceElevated =
  "rounded-xl border border-border/60 bg-card-elevated shadow-[0_8px_32px_rgba(42,36,31,0.06)]" as const;

export const inputClassName =
  "w-full rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors" as const;

export const eyebrowClassName =
  "text-[0.7rem] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-primary-muted" as const;

export const proseClassName =
  "text-base leading-[var(--leading-calm)] text-muted" as const;

export const displayHeadingClassName =
  "font-display text-4xl font-medium tracking-[var(--tracking-display)] text-foreground sm:text-5xl lg:text-[3.25rem]" as const;

export const sectionTitleClassName =
  "font-display text-3xl font-medium tracking-[var(--tracking-display)] text-foreground sm:text-4xl lg:text-[2.75rem]" as const;

export const imageFrameClassName =
  "relative overflow-hidden rounded-lg border border-border/70 shadow-[0_4px_24px_rgba(42,36,31,0.08)]" as const;
