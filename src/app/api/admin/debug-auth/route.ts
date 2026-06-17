import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  getAdminAuthState,
  getAdminCookieOptions,
  isSecureRequest,
  verifySessionToken,
} from "@/lib/admin-auth";
import { isAdminAuthDebugEnabled, logAuthTrace, maskSecret } from "@/lib/admin-auth-debug";

function getRequestHost(hostHeader: string | null, forwardedHost: string | null): string {
  return forwardedHost?.split(",")[0]?.trim() || hostHeader || "";
}

function isTunnelHost(host: string): boolean {
  const hostname = host.split(":")[0].toLowerCase();
  return (
    hostname.endsWith(".ngrok-free.app") ||
    hostname.endsWith(".ngrok-free.dev") ||
    hostname.endsWith(".ngrok.io") ||
    hostname.endsWith(".ngrok.app")
  );
}

export async function GET(request: Request) {
  if (!isAdminAuthDebugEnabled()) {
    return NextResponse.json({ error: "Debug endpoint disabled in production." }, { status: 404 });
  }

  const cookieStore = await cookies();
  const headersList = await headers();
  const adminSecret = process.env.ADMIN_SECRET;

  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const authState = getAdminAuthState(token, adminSecret);
  const cookieOptions = getAdminCookieOptions(60 * 60 * 24, request);
  const secureMode = isSecureRequest(request);
  const host = getRequestHost(headersList.get("host"), headersList.get("x-forwarded-host"));
  const forwardedProto = headersList.get("x-forwarded-proto");
  const tokenVerifyResult = adminSecret ? verifySessionToken(token, adminSecret) : false;

  const allCookieNames = cookieStore.getAll().map((c) => c.name);
  const hasAdminCookie = allCookieNames.includes(ADMIN_COOKIE_NAME);

  const payload = {
    timestamp: new Date().toISOString(),
    request: {
      method: request.method,
      url: request.url,
      host,
      isTunnelHost: isTunnelHost(host),
      forwardedProto,
      forwardedSsl: headersList.get("x-forwarded-ssl"),
    },
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasAdminSecret: Boolean(adminSecret),
      adminSecretMasked: maskSecret(adminSecret),
      adminForceSecureCookie: process.env.ADMIN_FORCE_SECURE_COOKIE === "true",
    },
    cookies: {
      names: allCookieNames,
      hasAdminCookie,
      adminCookieName: ADMIN_COOKIE_NAME,
      tokenMasked: maskSecret(token),
      tokenLooksSigned: Boolean(token?.includes(".")),
      tokenLength: token?.length ?? 0,
    },
    auth: {
      ...authState,
      tokenVerifyResult,
      middlewareWouldAllow: authState.authorized,
    },
    cookiePolicy: {
      name: cookieOptions.name,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
      httpOnly: cookieOptions.httpOnly,
      secureModeDetected: secureMode,
    },
  };

  logAuthTrace("DEBUG", "debug-auth endpoint hit", payload as unknown as Record<string, unknown>);

  return NextResponse.json(payload);
}
