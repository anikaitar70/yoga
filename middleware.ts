import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { logAuthTrace, maskSecret } from "@/lib/admin-auth-debug";
import { ADMIN_COOKIE_NAME, hasAdminSessionCookie } from "@/lib/admin-auth-shared";
import {
  VISITOR_COOKIE_NAME,
  VISITOR_MAX_AGE_SEC,
  getAnalyticsInternalSecret,
  normalizeAnalyticsPath,
  shouldTrackAnalyticsPath,
} from "@/lib/analytics-shared";

const FORM_RATE_LIMIT = 8;
const ADMIN_LOGIN_RATE_LIMIT = 5;
const WINDOW_MS = 60 * 1000;
const FORM_PATHS = new Set([
  "/api/contact",
  "/api/newsletter",
  "/api/testimonials",
  "/api/upload",
  "/api/upload/event-image",
]);
const ADMIN_LOGIN_PATHS = new Set(["/api/admin/login"]);
const ADMIN_AUTH_API_PATHS = new Set([
  "/api/admin/login",
  "/api/admin/logout",
  "/api/admin/debug-auth",
]);

interface RateEntry {
  count: number;
  expiresAt: number;
}

const rateStore = new Map<string, RateEntry>();

const securityHeaders: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Resource-Policy": "same-origin",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: wss:;",
};

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0].trim() || realIp || "unknown";
}

function applySecurityHeaders(
  response: NextResponse,
  options?: { skipCrossOriginIsolation?: boolean },
) {
  for (const [key, value] of Object.entries(securityHeaders)) {
    if (
      options?.skipCrossOriginIsolation &&
      (key === "Cross-Origin-Opener-Policy" ||
        key === "Cross-Origin-Embedder-Policy" ||
        key === "Cross-Origin-Resource-Policy")
    ) {
      continue;
    }
    response.headers.set(key, value);
  }
  return response;
}

/** Edge-safe: cookie presence only — verification runs in admin layout (Node). */
function logAdminMiddlewareCookie(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const allCookieNames = request.cookies.getAll().map((c) => c.name);
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const hasCookie = hasAdminSessionCookie(token);

  logAuthTrace("MIDDLEWARE", "Request received (edge-safe)", {
    route: pathname,
    method: request.method,
    host: request.headers.get("host"),
    forwardedProto: request.headers.get("x-forwarded-proto"),
    cookieNames: allCookieNames,
  });

  if (hasCookie) {
    logAuthTrace("MIDDLEWARE", "Session cookie present (format ok, not verified here)", {
      cookieName: ADMIN_COOKIE_NAME,
      tokenMasked: maskSecret(token),
      tokenLength: token?.length ?? 0,
    });
  } else {
    logAuthTrace("MIDDLEWARE", "Session cookie absent or invalid format", {
      cookieName: ADMIN_COOKIE_NAME,
      note: "Full verification runs in admin layout (Node runtime)",
    });
  }
}

function shouldSkipAnalyticsRequest(request: NextRequest): boolean {
  if (request.method !== "GET") {
    return true;
  }
  if (request.headers.get("rsc") === "1") {
    return true;
  }
  if (request.headers.get("purpose") === "prefetch") {
    return true;
  }
  if (request.headers.get("next-router-prefetch")) {
    return true;
  }
  return false;
}

function ensureVisitorCookie(request: NextRequest, response: NextResponse): string {
  const existing = request.cookies.get(VISITOR_COOKIE_NAME)?.value;
  if (existing) {
    return existing;
  }

  const visitorId = crypto.randomUUID();
  response.cookies.set({
    name: VISITOR_COOKIE_NAME,
    value: visitorId,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: VISITOR_MAX_AGE_SEC,
  });
  return visitorId;
}

async function recordAnalyticsPageView(request: NextRequest, pathname: string, visitorId: string) {
  const url = new URL("/api/analytics/record", request.url);
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-analytics-internal": getAnalyticsInternalSecret(),
    },
    body: JSON.stringify({
      path: normalizeAnalyticsPath(pathname),
      visitorId,
    }),
  }).catch(() => undefined);
}

export function middleware(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname;
  const isAdminAuthApi = ADMIN_AUTH_API_PATHS.has(pathname);
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");

  if (pathname === "/api/admin/login" && request.method === "POST") {
    console.error("[MIDDLEWARE] POST /api/admin/login", {
      host: request.headers.get("host"),
      contentType: request.headers.get("content-type"),
      at: new Date().toISOString(),
    });
  }

  if (isAdminPage || isAdminAuthApi) {
    logAdminMiddlewareCookie(request);
  }

  const response = NextResponse.next();
  applySecurityHeaders(response, {
    skipCrossOriginIsolation: isAdminAuthApi || isAdminPage,
  });

  if (request.method === "POST" && (FORM_PATHS.has(pathname) || ADMIN_LOGIN_PATHS.has(pathname))) {
    const ip = getClientIp(request);
    const now = Date.now();
    const key = `${pathname}:${ip}`;
    const entry = rateStore.get(key);
    const limit = ADMIN_LOGIN_PATHS.has(pathname) ? ADMIN_LOGIN_RATE_LIMIT : FORM_RATE_LIMIT;

    if (!entry || entry.expiresAt <= now) {
      rateStore.set(key, { count: 1, expiresAt: now + WINDOW_MS });
    } else {
      entry.count += 1;
      if (entry.count > limit) {
        const blockResponse = NextResponse.json(
          { error: "Too many requests. Please wait a moment and try again." },
          { status: 429 },
        );
        applySecurityHeaders(blockResponse, {
          skipCrossOriginIsolation: isAdminAuthApi || isAdminPage,
        });
        return blockResponse;
      }
      rateStore.set(key, entry);
    }
  }

  if (
    !shouldSkipAnalyticsRequest(request) &&
    shouldTrackAnalyticsPath(pathname)
  ) {
    const visitorId = ensureVisitorCookie(request, response);
    event.waitUntil(recordAnalyticsPageView(request, pathname, visitorId));
  }

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin",
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|bookmark_icon|brand/).*)",
  ],
};
