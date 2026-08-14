import { slugify } from "@/lib/utils";

const EVENT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Normalize event slugs for database storage and public URLs. */
export function normalizeEventSlug(value: string, fallbackTitle?: string): string {
  const fromSlug = slugify(value);
  if (fromSlug) return fromSlug;
  if (fallbackTitle) {
    const fromTitle = slugify(fallbackTitle);
    if (fromTitle) return fromTitle;
  }
  return "";
}

export function isValidEventSlug(value: string): boolean {
  return EVENT_SLUG_PATTERN.test(value);
}

/** Decode a dynamic route slug segment from the URL. */
export function decodeEventRouteSlug(rawSlug: string): string {
  try {
    return decodeURIComponent(rawSlug).trim();
  } catch {
    return rawSlug.trim();
  }
}

/** Candidate slugs to try when resolving a public event URL. */
export function eventSlugLookupCandidates(rawSlug: string): string[] {
  const decoded = decodeEventRouteSlug(rawSlug);
  const slugified = slugify(decoded);
  const candidates = [decoded, slugified].filter(Boolean);
  return [...new Set(candidates)];
}

export function specialEventPublicPath(slug: string): string {
  const normalized = slug.trim();
  if (!normalized) return "/events";
  return `/events/special/${encodeURIComponent(normalized)}`;
}
