export const VISITOR_COOKIE_NAME = "nirvana_visitor";
export const VISITOR_MAX_AGE_SEC = 60 * 60 * 24 * 365;

export function shouldTrackAnalyticsPath(pathname: string): boolean {
  if (!pathname || pathname === "/") {
    return true;
  }
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/_next")
  ) {
    return false;
  }
  if (/\.(ico|png|jpe?g|gif|webp|svg|woff2?|css|js|map|txt|xml)$/i.test(pathname)) {
    return false;
  }
  return true;
}

export function normalizeAnalyticsPath(pathname: string): string {
  const base = pathname.split("?")[0] || "/";
  if (base.length > 1 && base.endsWith("/")) {
    return base.slice(0, -1);
  }
  return base || "/";
}

export function getAnalyticsInternalSecret(): string {
  return process.env.ANALYTICS_INTERNAL_SECRET?.trim() || "dev-analytics-internal";
}
