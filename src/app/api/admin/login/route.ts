import { NextResponse } from "next/server";
import { applyAdminSessionCookie, verifyAdminSecret } from "@/lib/admin-auth";
import { getAdminRedirectPath } from "@/lib/admin-auth-shared";
import { logAuthTrace, maskSecret } from "@/lib/admin-auth-debug";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

async function parseSecretFromRequest(request: Request): Promise<string | null> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const body = await request.json();
      if (typeof body === "object" && body !== null && "secret" in body) {
        const secret = (body as { secret?: unknown }).secret;
        return typeof secret === "string" ? secret : null;
      }
    } catch {
      return null;
    }
    return null;
  }

  if (contentType.includes("form")) {
    try {
      const formData = await request.formData();
      return String(formData.get("secret") ?? "");
    } catch {
      return null;
    }
  }

  return null;
}

function wantsJsonResponse(request: Request): boolean {
  const contentType = request.headers.get("content-type") ?? "";
  const accept = request.headers.get("accept") ?? "";
  return contentType.includes("application/json") || accept.includes("application/json");
}

export async function POST(request: Request) {
  console.error("[AUTH API] LOGIN ROUTE HIT", {
    at: new Date().toISOString(),
    method: request.method,
    host: request.headers.get("host"),
    contentType: request.headers.get("content-type"),
  });

  const getHeader = (name: string) => request.headers.get(name);

  logAuthTrace("AUTH API", "Login request received", {
    host: getHeader("host"),
    forwardedProto: getHeader("x-forwarded-proto"),
    forwardedHost: getHeader("x-forwarded-host"),
  });

  if (!ADMIN_SECRET) {
    return NextResponse.json({ error: "Admin secret is not configured." }, { status: 500 });
  }

  const secret = await parseSecretFromRequest(request);

  logAuthTrace("AUTH API", "Parsed secret", {
    secretMasked: maskSecret(secret ?? undefined),
    hasSecret: Boolean(secret),
  });

  if (!secret?.trim()) {
    if (wantsJsonResponse(request)) {
      return NextResponse.json({ error: "Secret is required." }, { status: 400 });
    }
    return NextResponse.redirect(getAdminRedirectPath(getHeader, "Secret is required."), 303);
  }

  const authorized = verifyAdminSecret(secret, ADMIN_SECRET);

  logAuthTrace("AUTH API", "Validation result", { credentialsMatched: authorized });

  if (!authorized) {
    if (wantsJsonResponse(request)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    return NextResponse.redirect(getAdminRedirectPath(getHeader, "Unauthorized."), 303);
  }

  if (wantsJsonResponse(request)) {
    const response = NextResponse.json({ ok: true });
    applyAdminSessionCookie(response, ADMIN_SECRET, request, { clearLegacyPaths: false });
    const setCookies = response.headers.getSetCookie?.() ?? [];
    console.error("[AUTH API] LOGIN JSON WITH COOKIE", {
      setCookieCount: setCookies.length,
      setCookiePreview: setCookies[0]?.replace(/=.+?;/, "=***;") ?? "",
    });
    logAuthTrace("AUTH API", "JSON response with cookie", { setCookieCount: setCookies.length });
    return response;
  }

  const redirectTarget = getAdminRedirectPath(getHeader);
  const response = NextResponse.redirect(redirectTarget, 302);
  applyAdminSessionCookie(response, ADMIN_SECRET, request, { clearLegacyPaths: false });

  const setCookies = response.headers.getSetCookie?.() ?? [];
  console.error("[AUTH API] LOGIN REDIRECT WITH COOKIE", {
    redirectTarget,
    setCookieCount: setCookies.length,
    cookieNames: setCookies.map((c) => c.split("=")[0]),
  });

  logAuthTrace("AUTH API", "Redirect response with cookie", {
    redirectTarget,
    setCookieCount: setCookies.length,
  });

  return response;
}
