import { NextResponse, type NextRequest } from "next/server";

const FORM_RATE_LIMIT = 8;
const WINDOW_MS = 60 * 1000;
const FORM_PATHS = new Set(["/api/contact", "/api/newsletter", "/api/upload/event-image"]);

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
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
};

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0].trim() || realIp || "unknown";
}

function applySecurityHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  applySecurityHeaders(response);

  if (request.method === "POST" && FORM_PATHS.has(request.nextUrl.pathname)) {
    const ip = getClientIp(request);
    const now = Date.now();
    const key = `${request.nextUrl.pathname}:${ip}`;
    const entry = rateStore.get(key);

    if (!entry || entry.expiresAt <= now) {
      rateStore.set(key, { count: 1, expiresAt: now + WINDOW_MS });
    } else {
      entry.count += 1;
      if (entry.count > FORM_RATE_LIMIT) {
        const blockResponse = NextResponse.json(
          { error: "Too many requests. Please wait a moment and try again." },
          { status: 429 },
        );
        applySecurityHeaders(blockResponse);
        return blockResponse;
      }
      rateStore.set(key, entry);
    }
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
