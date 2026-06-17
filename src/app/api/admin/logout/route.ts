import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/admin-auth";
import { getAdminRedirectPath } from "@/lib/admin-auth-shared";

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true });
  clearAdminSessionCookie(response, request);
  return response;
}

/** Full-page sign-out (reliable Set-Cookie on navigation). */
export async function GET(request: Request) {
  const getHeader = (name: string) => request.headers.get(name);
  const response = NextResponse.redirect(getAdminRedirectPath(getHeader), 303);
  clearAdminSessionCookie(response, request);
  return response;
}
