"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { adminFetch, parseAdminJsonResponse } from "@/lib/admin-fetch";
import type { AdminSessionRecord } from "@/lib/admin-session-types";

type PeerPayload = {
  current: AdminSessionRecord | null;
  others: AdminSessionRecord[];
  recentPeerLogins: AdminSessionRecord[];
  untracked?: boolean;
};

type Toast = {
  id: string;
  message: string;
  tone: "info" | "warn";
};

const POLL_MS = 20_000;
const TOAST_MS = 8_000;
const SEEN_LOGIN_KEY = "nirvana_admin_seen_peer_logins";
const SEEN_PEER_KEY = "nirvana_admin_seen_peer_sessions";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function readSeenIds(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function writeSeenIds(key: string, ids: Set<string>) {
  sessionStorage.setItem(key, JSON.stringify([...ids]));
}

function pushToast(setter: Dispatch<SetStateAction<Toast[]>>, toast: Toast) {
  setter((current) => [...current, toast]);
  window.setTimeout(() => {
    setter((current) => current.filter((entry) => entry.id !== toast.id));
  }, TOAST_MS);
}

export function AdminSessionAlerts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [untracked, setUntracked] = useState(false);

  const poll = useCallback(async () => {
    try {
      const response = await adminFetch("/api/admin/sessions", {
        method: "POST",
        credentials: "include",
      });
      const parsed = await parseAdminJsonResponse<PeerPayload>(response);
      if (!parsed.ok || !response.ok) {
        return;
      }

      const data = parsed.data;
      setUntracked(Boolean(data.untracked));

      const seenLogins = readSeenIds(SEEN_LOGIN_KEY);
      const seenPeers = readSeenIds(SEEN_PEER_KEY);

      const recentPeerLogins = Array.isArray(data.recentPeerLogins) ? data.recentPeerLogins : [];
      for (const login of recentPeerLogins) {
        if (seenLogins.has(login.id)) continue;
        seenLogins.add(login.id);
        pushToast(setToasts, {
          id: `login-${login.id}-${Date.now()}`,
          tone: "info",
          message: `${login.displayName} just signed in from ${login.ipAddress} at ${formatWhen(login.loginAt)}.`,
        });
      }
      writeSeenIds(SEEN_LOGIN_KEY, seenLogins);

      const others = Array.isArray(data.others) ? data.others : [];
      for (const session of others) {
        if (seenPeers.has(session.id)) continue;
        seenPeers.add(session.id);
        pushToast(setToasts, {
          id: `peer-${session.id}-${Date.now()}`,
          tone: "warn",
          message: `${session.displayName} is also signed in (${session.email}).`,
        });
      }
      writeSeenIds(SEEN_PEER_KEY, seenPeers);
    } catch {
      // ignore polling errors
    }
  }, []);

  useEffect(() => {
    void poll();
    const timer = window.setInterval(() => void poll(), POLL_MS);
    return () => window.clearInterval(timer);
  }, [poll]);

  if (toasts.length === 0 && !untracked) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
      {untracked ? (
        <div className="pointer-events-auto rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-lg">
          Session tracking is not active for this browser. Sign out and use{" "}
          <strong>Sign in with GitHub</strong> to enable peer alerts.
        </div>
      ) : null}
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={
            toast.tone === "warn"
              ? "pointer-events-auto rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-lg"
              : "pointer-events-auto rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950 shadow-lg"
          }
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
