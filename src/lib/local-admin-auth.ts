import { timingSafeEqual, createHash } from "crypto";
import { getRequestHost } from "@/lib/admin-auth-shared";

/** Production hostnames — local login must never be offered here. */
const PRODUCTION_HOSTNAMES = new Set([
  "nirvanayoga.org",
  "www.nirvanayoga.org",
]);

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

function hashSecret(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const aBuf = hashSecret(a);
  const bBuf = hashSecret(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

function hostnameFromHostHeader(host: string): string {
  return host.split(":")[0]?.trim().toLowerCase() ?? "";
}

function isProductionAppUrl(): boolean {
  const appUrl = (process.env.APP_URL ?? process.env.SITE_URL ?? "").toLowerCase();
  if (!appUrl) return false;
  try {
    const hostname = new URL(appUrl).hostname.toLowerCase();
    return PRODUCTION_HOSTNAMES.has(hostname);
  } catch {
    return appUrl.includes("nirvanayoga.org");
  }
}

function hasLocalCredentials(): boolean {
  const username = process.env.LOCAL_ADMIN_USERNAME?.trim();
  const password = process.env.LOCAL_ADMIN_PASSWORD;
  return Boolean(username && password && password.length > 0);
}

/**
 * Whether local username/password login may be offered or accepted.
 * Requires development mode, local credentials in env, and a non-production request host.
 */
export function isLocalDevAdminLoginEnabled(request?: Request): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.ALLOW_LOCAL_ADMIN_LOGIN === "false") return false;
  if (!hasLocalCredentials()) return false;

  if (request) {
    const hostname = hostnameFromHostHeader(getRequestHost(request));
    if (PRODUCTION_HOSTNAMES.has(hostname)) return false;
    if (!LOCAL_HOSTNAMES.has(hostname)) return false;
    // Serving on production hostname — never allow local login even in dev builds.
    if (isProductionAppUrl() && PRODUCTION_HOSTNAMES.has(hostname)) return false;
  }

  return true;
}

/** UI hint for the admin login page (env-only; POST still validates request host). */
export function isLocalDevAdminLoginAvailable(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.ALLOW_LOCAL_ADMIN_LOGIN === "false") return false;
  return hasLocalCredentials();
}

export function getLocalAdminSessionEmail(): string {
  return "local-dev@localhost";
}

export function verifyLocalAdminCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.LOCAL_ADMIN_USERNAME?.trim() ?? "";
  const expectedPass = process.env.LOCAL_ADMIN_PASSWORD ?? "";
  if (!expectedUser || !expectedPass) return false;
  if (!username || !password) return false;
  return (
    timingSafeStringEqual(username.trim(), expectedUser) &&
    timingSafeStringEqual(password, expectedPass)
  );
}
