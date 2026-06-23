import { NextResponse } from "next/server";
import { getAdminRedirectPath } from "@/lib/admin-auth-shared";
import { buildGitHubAuthorizeUrl, createOAuthState, OAUTH_STATE_COOKIE, OAUTH_STATE_MAX_AGE_SEC } from "@/lib/github-oauth";
import { getAdminCookieOptions } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const getHeader = (name: string) => request.headers.get(name);
  const state = createOAuthState();
  const authorizeUrl = buildGitHubAuthorizeUrl(state);

  if (!authorizeUrl) {
    return NextResponse.redirect(
      getAdminRedirectPath(getHeader, "GitHub sign-in is not configured.", request.url),
      303,
    );
  }

  const response = NextResponse.redirect(authorizeUrl, 302);
  const cookieOptions = getAdminCookieOptions(OAUTH_STATE_MAX_AGE_SEC, request);
  response.cookies.set({
    ...cookieOptions,
    name: OAUTH_STATE_COOKIE,
    value: state,
    maxAge: OAUTH_STATE_MAX_AGE_SEC,
  });

  return response;
}
