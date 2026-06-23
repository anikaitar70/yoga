import type { NavItem } from "@/content/types";

/** Default navigation order for admin preview when site config is unavailable. */
export const PREVIEW_NAVIGATION: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Yoga", href: "/yoga" },
  { label: "Healing", href: "/healing" },
  { label: "Just Art Affaire", href: "/just-art-life" },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function filterPublicNavigation(navigation: NavItem[]): NavItem[] {
  return navigation;
}
