/**
 * Node.js runtime admin auth (crypto session tokens).
 * Do not import this file from middleware (Edge runtime).
 */
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { NextResponse } from "next/server";
import { logAuthTrace } from "@/lib/admin-auth-debug";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_LEGACY_COOKIE_PATHS,
  ADMIN_SESSION_COOKIE_PATHS,
  ADMIN_SESSION_MAX_AGE_SEC,
  formatAdminSessionClearCookieHeader,
  getAdminCookieOptions,
  getRequestHost,
  isTunnelHost,
} from "@/lib/admin-auth-shared";

export {
  ADMIN_COOKIE_NAME,
  getAdminCookieOptions,
  getRequestHost,
  isSecureRequest,
  isTunnelHost,
} from "@/lib/admin-auth-shared";

export function applyAdminSessionCookie(
  response: NextResponse,
  adminSecret: string,
  request: Request,
  options?: { clearLegacyPaths?: boolean; sessionId?: string },
) {
  const cookieOptions = getAdminCookieOptions(ADMIN_SESSION_MAX_AGE_SEC, request);
  const sessionToken = createSessionToken(adminSecret, options?.sessionId);
  response.cookies.set({
    ...cookieOptions,
    value: sessionToken,
  });

  if (options?.clearLegacyPaths !== false) {
    for (const legacyPath of ADMIN_LEGACY_COOKIE_PATHS) {
      response.cookies.set({
        ...cookieOptions,
        path: legacyPath,
        value: "",
        maxAge: 0,
      });
    }
  }

  const setCookies = response.headers.getSetCookie?.() ?? [];
  logAuthTrace("COOKIE", "Session cookie set", {
    cookieName: ADMIN_COOKIE_NAME,
    host: getRequestHost(request),
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
    httpOnly: cookieOptions.httpOnly,
    maxAge: cookieOptions.maxAge,
    isTunnelHost: isTunnelHost(getRequestHost(request)),
    forwardedProto: request.headers.get("x-forwarded-proto"),
    tokenLength: sessionToken.length,
    setCookieCount: setCookies.length,
    setCookiePreview: setCookies[0]?.replace(/=.+?;/, "=***;") ?? "",
  });
}

export function clearAdminSessionCookie(response: NextResponse, request: Request) {
  const baseOptions = getAdminCookieOptions(0, request);

  // Next.js response.cookies deduplicates by name — only the last path would be sent.
  // Append one Set-Cookie per path so the browser clears the cookie at "/".
  for (const path of ADMIN_SESSION_COOKIE_PATHS) {
    response.headers.append("Set-Cookie", formatAdminSessionClearCookieHeader(request, path));
  }

  const setCookies = response.headers.getSetCookie?.() ?? [];
  logAuthTrace("COOKIE", "Session cookie cleared", {
    cookieName: ADMIN_COOKIE_NAME,
    host: getRequestHost(request),
    secure: baseOptions.secure,
    sameSite: baseOptions.sameSite,
    pathsCleared: [...ADMIN_SESSION_COOKIE_PATHS],
    setCookieCount: setCookies.length,
  });
}

export function createSessionToken(adminSecret: string, sessionId?: string): string {
  const nonce = randomBytes(32).toString("hex");
  const issuedAt = Date.now().toString();
  const payload = sessionId ? `${nonce}.${issuedAt}.${sessionId}` : `${nonce}.${issuedAt}`;
  const sig = createHmac("sha256", adminSecret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export type ParsedAdminSessionToken = {
  valid: boolean;
  sessionId?: string;
  issuedAt?: number;
};

function verifyTokenSignature(token: string, adminSecret: string): ParsedAdminSessionToken {
  if (!token) return { valid: false };

  const lastDot = token.lastIndexOf(".");
  if (lastDot <= 0) return { valid: false };

  const sig = token.slice(lastDot + 1);
  const payload = token.slice(0, lastDot);
  const parts = payload.split(".");
  if (parts.length < 2) return { valid: false };

  const nonce = parts[0];
  const issuedAtStr = parts[1];
  const issuedAt = Number(issuedAtStr);
  const sessionId = parts.length > 2 ? parts.slice(2).join(".") : undefined;

  if (!nonce || !issuedAtStr || !sig || !Number.isFinite(issuedAt)) return { valid: false };

  const ageMs = Date.now() - issuedAt;
  if (ageMs < 0 || ageMs > ADMIN_SESSION_MAX_AGE_SEC * 1000) return { valid: false };

  const expected = createHmac("sha256", adminSecret).update(payload).digest("hex");
  try {
    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expectedBuf.length) return { valid: false };
    if (!timingSafeEqual(sigBuf, expectedBuf)) return { valid: false };
    return { valid: true, sessionId, issuedAt };
  } catch {
    return { valid: false };
  }
}

export function parseAdminSessionToken(
  token: string | undefined,
  adminSecret: string,
): ParsedAdminSessionToken {
  if (!token || !adminSecret) return { valid: false };
  return verifyTokenSignature(token, adminSecret);
}

export function verifySessionToken(token: string | undefined, adminSecret: string): boolean {
  return verifyTokenSignature(token ?? "", adminSecret).valid;
}

export function verifyAdminSecret(input: string, adminSecret: string): boolean {
  try {
    const inputBuf = Buffer.from(input);
    const secretBuf = Buffer.from(adminSecret);
    if (inputBuf.length !== secretBuf.length) return false;
    return timingSafeEqual(inputBuf, secretBuf);
  } catch {
    return false;
  }
}

export function getAdminAuthState(token: string | undefined, adminSecret: string | undefined) {
  const hasConfiguredSecret = Boolean(adminSecret);
  const hasToken = Boolean(token);
  const tokenLooksSigned = Boolean(token?.includes("."));
  const tokenVerifyResult = Boolean(adminSecret && verifySessionToken(token, adminSecret));
  const authorized = tokenVerifyResult;

  return {
    hasConfiguredSecret,
    hasToken,
    tokenLooksSigned,
    tokenVerifyResult,
    authorized,
    tokenParseFailure:
      hasToken && !tokenLooksSigned
        ? "missing_dot_separator"
        : hasToken && !tokenVerifyResult
          ? "signature_mismatch_or_invalid"
          : null,
  };
}
