/**
 * Edge-safe admin auth helpers (no Node.js crypto).
 * Used by middleware and shared cookie configuration.
 */

export const ADMIN_COOKIE_NAME = "nirvana_admin_token";

/** Session lifetime — must match cookie maxAge and token verification. */
export const ADMIN_SESSION_MAX_AGE_SEC = 60 * 60 * 24;

const LEGACY_COOKIE_PATHS = ["/admin"];

export type HeaderGetter = (name: string) => string | null | undefined;

export function getHostFromHeaders(getHeader: HeaderGetter): string {
  const forwarded = getHeader("x-forwarded-host");
  const host = getHeader("host");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "";
  return host ?? "";
}

export function getRequestHost(request: Request): string {
  return getHostFromHeaders((name) => request.headers.get(name));
}

export function isTunnelHost(host: string): boolean {
  const hostname = host.split(":")[0].toLowerCase();
  return (
    hostname.endsWith(".ngrok-free.app") ||
    hostname.endsWith(".ngrok-free.dev") ||
    hostname.endsWith(".ngrok.io") ||
    hostname.endsWith(".ngrok.app")
  );
}

export function isSecureFromHeaders(getHeader: HeaderGetter): boolean {
  if (process.env.ADMIN_FORCE_SECURE_COOKIE === "true") return true;
  if (process.env.NODE_ENV === "production") return true;

  const host = getHostFromHeaders(getHeader);
  if (isTunnelHost(host)) return true;

  const forwardedProto = getHeader("x-forwarded-proto");
  if (forwardedProto) {
    const proto = forwardedProto.split(",").pop()?.trim();
    if (proto === "https") return true;
  }

  if (getHeader("x-forwarded-ssl") === "on") return true;
  return false;
}

/** True when cookies must use the Secure flag (HTTPS, ngrok, or production). */
export function isSecureRequest(request?: Request): boolean {
  if (!request) return false;
  return isSecureFromHeaders((name) => request.headers.get(name));
}

function getSameSiteForHost(host: string): "lax" | "none" {
  // ngrok and other TLS tunnels: None+Secure is more reliable after POST/redirect
  if (isTunnelHost(host)) return "none";
  return "lax";
}

export function getAdminCookieOptions(maxAge = ADMIN_SESSION_MAX_AGE_SEC, request?: Request) {
  const host = request ? getRequestHost(request) : "";
  const secure = isSecureRequest(request);
  const sameSite = getSameSiteForHost(host);
  return {
    name: ADMIN_COOKIE_NAME,
    httpOnly: true,
    path: "/",
    maxAge,
    sameSite,
    secure: sameSite === "none" ? true : secure,
  };
}

export function getAdminCookieOptionsFromHeaders(
  getHeader: HeaderGetter,
  maxAge = ADMIN_SESSION_MAX_AGE_SEC,
) {
  const host = getHostFromHeaders(getHeader);
  const sameSite = getSameSiteForHost(host);
  const secure = sameSite === "none" ? true : isSecureFromHeaders(getHeader);
  return {
    name: ADMIN_COOKIE_NAME,
    httpOnly: true,
    path: "/",
    maxAge,
    sameSite,
    secure,
  };
}

/** Build admin path; use absolute URL when behind ngrok so redirect stays on tunnel host. */
export function getAdminRedirectPath(getHeader: HeaderGetter, loginError?: string): string {
  const path = loginError
    ? `/admin?login_error=${encodeURIComponent(loginError)}`
    : "/admin";

  const host = getHostFromHeaders(getHeader);
  if (!isTunnelHost(host)) return path;

  const proto = getHeader("x-forwarded-proto")?.split(",").pop()?.trim() || "https";
  return `${proto}://${host}${path}`;
}

export const ADMIN_LEGACY_COOKIE_PATHS = LEGACY_COOKIE_PATHS;

/** Paths where admin session cookies may exist (primary first). */
export const ADMIN_SESSION_COOKIE_PATHS = ["/", ...LEGACY_COOKIE_PATHS] as const;

/**
 * Build a Set-Cookie header that expires the session cookie at `path`.
 * Use headers.append() per path — response.cookies.set() overwrites same name.
 */
export function formatAdminSessionClearCookieHeader(
  request: Request | undefined,
  path: string,
): string {
  const opts = getAdminCookieOptions(0, request);
  const sameSite = opts.sameSite === "none" ? "None" : "Lax";
  const parts = [
    `${ADMIN_COOKIE_NAME}=`,
    `Path=${path}`,
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "Max-Age=0",
    "HttpOnly",
  ];
  if (opts.secure) parts.push("Secure");
  parts.push(`SameSite=${sameSite}`);
  return parts.join("; ");
}

/** Lightweight check for middleware — no cryptographic verification. */
export function hasAdminSessionCookie(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  return parts.length === 3 && parts.every((part) => part.length > 0);
}
