import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { parseAdminSessionToken } from "@/lib/admin-auth";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth-shared";
import { getAdminSessionRecord, touchAdminSessionRecord } from "@/lib/admin-session-store";

/**
 * Verifies the admin session cookie for API route handlers (Node runtime).
 * Returns a 401/500 response to return early, or null when the request is authorized.
 */
export async function requireAdminSession(): Promise<NextResponse | null> {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json({ error: "Admin session signing is not configured." }, { status: 500 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const parsed = parseAdminSessionToken(token, adminSecret);

  if (!parsed.valid) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (parsed.sessionId) {
    const session = await getAdminSessionRecord(parsed.sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session expired." }, { status: 401 });
    }
    void touchAdminSessionRecord(parsed.sessionId);
  }

  return null;
}

export async function getCurrentAdminSessionId(): Promise<string | undefined> {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return undefined;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const parsed = parseAdminSessionToken(token, adminSecret);
  if (!parsed.valid || !parsed.sessionId) return undefined;

  const session = await getAdminSessionRecord(parsed.sessionId);
  return session?.id;
}
