import { NextResponse } from "next/server";
import { applyAdminSessionCookie } from "@/lib/admin-auth";
import { getAdminRedirectPath } from "@/lib/admin-auth-shared";
import { recordDiagnosticEvent } from "@/lib/app-diagnostics";
import {
  getLocalAdminSessionEmail,
  isLocalDevAdminLoginEnabled,
  verifyLocalAdminCredentials,
} from "@/lib/local-admin-auth";
import { createAdminSessionRecord } from "@/lib/admin-session-store";
import { getClientIpFromRequest } from "@/lib/request-client-ip";

const ADMIN_SESSION_SECRET = process.env.ADMIN_SECRET;

/** Whether local dev login is available on this request (for admin login UI). */
export async function GET(request: Request) {
  return NextResponse.json({ available: isLocalDevAdminLoginEnabled(request) });
}

export async function POST(request: Request) {
  if (!isLocalDevAdminLoginEnabled(request)) {
    return NextResponse.json({ error: "Local admin login is not available." }, { status: 404 });
  }

  if (!ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Admin session signing is not configured." }, { status: 500 });
  }

  const getHeader = (name: string) => request.headers.get(name);
  const contentType = request.headers.get("content-type") ?? "";
  const accept = request.headers.get("accept") ?? "";
  const wantsJson =
    contentType.includes("application/json") || accept.includes("application/json");

  let username = "";
  let password = "";

  try {
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { username?: string; password?: string };
      username = String(body.username ?? "");
      password = String(body.password ?? "");
    } else {
      const form = await request.formData();
      username = String(form.get("username") ?? "");
      password = String(form.get("password") ?? "");
    }
  } catch {
    const message = "Invalid login request.";
    if (wantsJson) return NextResponse.json({ error: message }, { status: 400 });
    return NextResponse.redirect(getAdminRedirectPath(getHeader, message, request.url), 303);
  }

  if (!verifyLocalAdminCredentials(username, password)) {
    recordDiagnosticEvent("LOGIN_FAILURE", "Local dev login rejected", {
      reason: "invalid_credentials",
    });
    const message = "Invalid username or password.";
    if (wantsJson) return NextResponse.json({ error: message }, { status: 401 });
    return NextResponse.redirect(getAdminRedirectPath(getHeader, message, request.url), 303);
  }

  const session = await createAdminSessionRecord({
    email: getLocalAdminSessionEmail(),
    ipAddress: getClientIpFromRequest(request),
    userAgent: request.headers.get("user-agent"),
  });

  if (wantsJson) {
    const response = NextResponse.json({ ok: true, redirect: "/admin" });
    applyAdminSessionCookie(response, ADMIN_SESSION_SECRET, request, {
      clearLegacyPaths: false,
      sessionId: session.id,
    });
    return response;
  }

  const response = NextResponse.redirect(getAdminRedirectPath(getHeader, undefined, request.url), 302);
  applyAdminSessionCookie(response, ADMIN_SESSION_SECRET, request, {
    clearLegacyPaths: false,
    sessionId: session.id,
  });
  return response;
}
