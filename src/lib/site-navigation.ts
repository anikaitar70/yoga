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
  { label: "Testimonials", href: "/testimonials" },
];

export const SECONDARY_NAV_HREFS = ["/gallery", "/blog", "/contact", "/testimonials"] as const;

export function filterPublicNavigation(navigation: NavItem[]): NavItem[] {
  return navigation;
}
