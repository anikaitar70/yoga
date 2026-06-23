import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { clearAdminSessionCookie, parseAdminSessionToken } from "@/lib/admin-auth";
import { ADMIN_COOKIE_NAME, getAdminRedirectPath } from "@/lib/admin-auth-shared";
import { revokeAdminSessionRecord } from "@/lib/admin-session-store";

async function revokeCurrentSession(request: Request) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const parsed = parseAdminSessionToken(token, adminSecret);
  if (parsed.sessionId) {
    await revokeAdminSessionRecord(parsed.sessionId);
  }
}

export async function POST(request: Request) {
  await revokeCurrentSession(request);
  const response = NextResponse.json({ ok: true });
  clearAdminSessionCookie(response, request);
  return response;
}

/** Full-page sign-out (reliable Set-Cookie on navigation). */
export async function GET(request: Request) {
  await revokeCurrentSession(request);
  const getHeader = (name: string) => request.headers.get(name);
  const response = NextResponse.redirect(getAdminRedirectPath(getHeader, undefined, request.url), 303);
  clearAdminSessionCookie(response, request);
  return response;
}
