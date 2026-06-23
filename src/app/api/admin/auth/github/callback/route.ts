import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { applyAdminSessionCookie } from "@/lib/admin-auth";
import { ADMIN_COOKIE_NAME, getAdminRedirectPath } from "@/lib/admin-auth-shared";
import { isAllowedAdminEmail } from "@/lib/admin-allowed-emails";
import { recordDiagnosticEvent } from "@/lib/app-diagnostics";
import {
  exchangeGitHubCodeForToken,
  fetchGitHubPrimaryVerifiedEmail,
  OAUTH_STATE_COOKIE,
} from "@/lib/github-oauth";
import { getAdminCookieOptions } from "@/lib/admin-auth";
import { createAdminSessionRecord } from "@/lib/admin-session-store";
import { getClientIpFromRequest } from "@/lib/request-client-ip";

const ADMIN_SESSION_SECRET = process.env.ADMIN_SECRET;

export async function GET(request: Request) {
  const getHeader = (name: string) => request.headers.get(name);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    recordDiagnosticEvent("LOGIN_FAILURE", "GitHub OAuth denied", { error: oauthError });
    return NextResponse.redirect(
      getAdminRedirectPath(getHeader, "GitHub sign-in was cancelled.", request.url),
      303,
    );
  }

  if (!ADMIN_SESSION_SECRET) {
    return NextResponse.redirect(
      getAdminRedirectPath(getHeader, "Admin session signing is not configured.", request.url),
      303,
    );
  }

  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !stateCookie || stateCookie !== state) {
    recordDiagnosticEvent("LOGIN_FAILURE", "GitHub OAuth state mismatch", {});
    return NextResponse.redirect(
      getAdminRedirectPath(getHeader, "Sign-in session expired. Try again.", request.url),
      303,
    );
  }

  const accessToken = await exchangeGitHubCodeForToken(code);
  if (!accessToken) {
    recordDiagnosticEvent("LOGIN_FAILURE", "GitHub OAuth token exchange failed", {});
    return NextResponse.redirect(
      getAdminRedirectPath(getHeader, "Unable to complete GitHub sign-in.", request.url),
      303,
    );
  }

  const email = await fetchGitHubPrimaryVerifiedEmail(accessToken);
  if (!isAllowedAdminEmail(email)) {
    recordDiagnosticEvent("LOGIN_FAILURE", "GitHub OAuth email not allowed", {
      email: email ?? "unknown",
    });
    return NextResponse.redirect(
      getAdminRedirectPath(
        getHeader,
        "This GitHub account is not authorized for admin access.",
        request.url,
      ),
      303,
    );
  }

  const session = await createAdminSessionRecord({
    email: email!,
    ipAddress: getClientIpFromRequest(request),
    userAgent: request.headers.get("user-agent"),
  });

  const response = NextResponse.redirect(getAdminRedirectPath(getHeader, undefined, request.url), 302);
  applyAdminSessionCookie(response, ADMIN_SESSION_SECRET, request, {
    clearLegacyPaths: false,
    sessionId: session.id,
  });

  const clearOptions = getAdminCookieOptions(0, request);
  response.cookies.set({
    ...clearOptions,
    name: OAUTH_STATE_COOKIE,
    value: "",
    maxAge: 0,
  });

  return response;
}
