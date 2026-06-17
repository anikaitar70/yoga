import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminAuthState } from "@/lib/admin-auth";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth-shared";

/**
 * Verifies the admin session cookie for API route handlers (Node runtime).
 * Returns a 401/500 response to return early, or null when the request is authorized.
 */
export async function requireAdminSession(): Promise<NextResponse | null> {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json({ error: "Admin secret is not configured." }, { status: 500 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const authState = getAdminAuthState(token, adminSecret);

  if (!authState.authorized) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return null;
}
