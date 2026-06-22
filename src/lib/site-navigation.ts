import type { NavItem } from "@/content/types";

/** Routes hidden from the public navbar — pages remain accessible by direct URL. */
export const HIDDEN_NAV_HREFS = new Set(["/just-art-life"]);

export function filterPublicNavigation(navigation: NavItem[]): NavItem[] {
  return navigation.filter((item) => !HIDDEN_NAV_HREFS.has(item.href));
}

export const PREVIEW_NAVIGATION: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Yoga", href: "/yoga" },
  { label: "Healing", href: "/healing" },
  { label: "Events", href: "/events" },
  { label: "Contact", href: "/contact" },
];
