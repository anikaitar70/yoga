"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch, parseAdminJsonResponse } from "@/lib/admin-fetch";
import type { AdminSessionRecord } from "@/lib/admin-session-types";

type PeerPayload = {
  current: AdminSessionRecord | null;
  others: AdminSessionRecord[];
  recentPeerLogins: AdminSessionRecord[];
  untracked?: boolean;
};

const POLL_MS = 20_000;
const SEEN_KEY = "nirvana_admin_seen_peer_logins";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function readSeenIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(SEEN_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function writeSeenIds(ids: Set<string>) {
  sessionStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
}

export function AdminSessionAlerts() {
  const [others, setOthers] = useState<AdminSessionRecord[]>([]);
  const [alerts, setAlerts] = useState<AdminSessionRecord[]>([]);
  const [untracked, setUntracked] = useState(false);

  const poll = useCallback(async () => {
    try {
      const response = await adminFetch("/api/admin/sessions", {
        method: "POST",
        credentials: "include",
      });
      const parsed = await parseAdminJsonResponse<PeerPayload>(response);
      if (!parsed.ok || !response.ok) {
        setOthers([]);
        return;
      }

      const data = parsed.data;
      setOthers(Array.isArray(data.others) ? data.others : []);
      setUntracked(Boolean(data.untracked));

      const recentPeerLogins = Array.isArray(data.recentPeerLogins) ? data.recentPeerLogins : [];
      const seen = readSeenIds();
      const fresh = recentPeerLogins.filter((login) => !seen.has(login.id));
      if (fresh.length > 0) {
        for (const login of fresh) seen.add(login.id);
        writeSeenIds(seen);
        setAlerts((current) => [...fresh, ...current].slice(0, 5));
      }
    } catch {
      setOthers([]);
    }
  }, []);

  useEffect(() => {
    void poll();
    const timer = window.setInterval(() => void poll(), POLL_MS);
    return () => window.clearInterval(timer);
  }, [poll]);

  if (others.length === 0 && alerts.length === 0 && !untracked) return null;

  return (
    <div className="space-y-2">
      {untracked ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700">
          Session tracking is not active for this browser.{" "}
          <Link href="/api/admin/logout" className="font-semibold underline">
            Sign out
          </Link>{" "}
          and use <strong>Sign in with GitHub</strong> to enable session management and peer alerts.
        </div>
      ) : null}
      {alerts.map((login) => (
        <div
          key={`alert-${login.id}`}
          className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          <strong>{login.displayName}</strong> just signed in from{" "}
          <span className="font-mono text-xs">{login.ipAddress}</span> at {formatWhen(login.loginAt)}.
        </div>
      ))}

      {others.length > 0 ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
          <p className="font-medium">Another admin is also signed in</p>
          <ul className="mt-2 space-y-1">
            {others.map((session) => (
              <li key={session.id}>
                <strong>{session.displayName}</strong> ({session.email}) — IP{" "}
                <span className="font-mono text-xs">{session.ipAddress}</span>, active since{" "}
                {formatWhen(session.loginAt)}
              </li>
            ))}
          </ul>
          <Link href="/admin/sessions" className="mt-2 inline-block text-xs font-semibold underline">
            View session management
          </Link>
        </div>
      ) : null}
    </div>
  );
}
