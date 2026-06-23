import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseAdminSessionToken } from "@/lib/admin-auth";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth-shared";
import {
  getAdminSessionRecord,
  listActiveAdminSessions,
  listRecentPeerLogins,
  revokeAdminSessionRecord,
  touchAdminSessionRecord,
} from "@/lib/admin-session-store";
import { getCurrentAdminSessionId, requireAdminSession } from "@/lib/require-admin-session";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const currentSessionId = await getCurrentAdminSessionId();
  const sessions = await listActiveAdminSessions(currentSessionId);

  return NextResponse.json({ sessions, currentSessionId: currentSessionId ?? null });
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const currentSessionId = await getCurrentAdminSessionId();
  if (!currentSessionId) {
    return NextResponse.json({ error: "No tracked session." }, { status: 400 });
  }

  const url = new URL(request.url);
  const targetId = url.searchParams.get("id");
  if (!targetId) {
    return NextResponse.json({ error: "Session id is required." }, { status: 400 });
  }

  if (targetId === currentSessionId) {
    return NextResponse.json({ error: "Use Sign out to end your own session." }, { status: 400 });
  }

  await revokeAdminSessionRecord(targetId);
  return NextResponse.json({ ok: true });
}

/** Lightweight poll for concurrent admin awareness banners. */
export async function POST() {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const parsed = parseAdminSessionToken(token, adminSecret);
  if (!parsed.valid) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const emptyPeers = {
    current: null,
    others: [] as const,
    recentPeerLogins: [] as const,
    untracked: true as const,
  };

  if (!parsed.sessionId) {
    return NextResponse.json(emptyPeers);
  }

  const session = await getAdminSessionRecord(parsed.sessionId);
  if (!session) {
    return NextResponse.json(emptyPeers);
  }

  await touchAdminSessionRecord(parsed.sessionId);

  const since = new Date(Date.now() - 10 * 60 * 1000);
  const [sessions, recentPeerLogins] = await Promise.all([
    listActiveAdminSessions(parsed.sessionId),
    listRecentPeerLogins(parsed.sessionId, since),
  ]);

  const current = sessions.find((item) => item.isCurrent) ?? null;
  const others = sessions.filter((item) => !item.isCurrent);

  return NextResponse.json({
    current,
    others,
    recentPeerLogins,
    untracked: false,
  });
}
