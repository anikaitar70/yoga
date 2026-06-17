export type ScrollRailVariant = "testimonial" | "testimonialFeatured" | "event" | "gallery";

/** Item counts above this use a horizontal scroll rail instead of a tall grid. */
export const SCROLL_RAIL_THRESHOLD: Record<ScrollRailVariant, number> = {
  testimonial: 3,
  testimonialFeatured: 2,
  event: 3,
  gallery: 4,
};

export const SCROLL_RAIL_ITEM_CLASS: Record<ScrollRailVariant, string> = {
  testimonial: "w-[var(--card-w,min(85vw,280px))] shrink-0 snap-start px-2 py-3",
  testimonialFeatured: "w-[var(--card-w,min(88vw,400px))] shrink-0 snap-start px-2 py-3",
  event: "w-[var(--card-w,min(88vw,360px))] shrink-0 snap-start px-2 py-3",
  gallery: "w-[var(--card-w,min(70vw,240px))] shrink-0 snap-start px-2 py-3",
};

export const SCROLL_RAIL_GRID_CLASS: Record<ScrollRailVariant, string> = {
  testimonial:
    "grid gap-8 sm:grid-cols-2 lg:[grid-template-columns:repeat(var(--cards-visible,3),minmax(0,1fr))]",
  testimonialFeatured:
    "grid gap-10 sm:grid-cols-1 lg:[grid-template-columns:repeat(var(--cards-visible,2),minmax(0,1fr))]",
  event: "grid gap-6 lg:grid-cols-2",
  gallery:
    "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:[grid-template-columns:repeat(var(--cards-visible,3),minmax(0,1fr))]",
};

export const SCROLL_RAIL_HINT: Record<ScrollRailVariant, string> = {
  testimonial: "Scroll to read more reflections",
  testimonialFeatured: "Scroll through community voices",
  event: "Scroll to browse upcoming gatherings",
  gallery: "Scroll to explore the gallery",
};

export function shouldUseScrollRail(variant: ScrollRailVariant, itemCount: number): boolean {
  return itemCount > SCROLL_RAIL_THRESHOLD[variant];
}
