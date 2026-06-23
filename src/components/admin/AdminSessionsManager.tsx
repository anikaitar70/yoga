"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, parseAdminJsonResponse } from "@/lib/admin-fetch";
import type { AdminSessionRecord } from "@/lib/admin-session-types";

type SessionsPayload = {
  sessions: AdminSessionRecord[];
  currentSessionId: string | null;
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function AdminSessionsManager() {
  const [sessions, setSessions] = useState<AdminSessionRecord[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminFetch("/api/admin/sessions", { credentials: "include" });
      const parsed = await parseAdminJsonResponse<SessionsPayload>(response);
      if (!parsed.ok) {
        setMessage(parsed.error);
        return;
      }
      setSessions(parsed.data.sessions);
      setCurrentSessionId(parsed.data.currentSessionId);
      setMessage(null);
    } catch {
      setMessage("Unable to load sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 20_000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function revokeSession(id: string) {
    if (!window.confirm("End this admin session? That browser will need to sign in again.")) return;
    setMessage(null);
    try {
      const response = await adminFetch(`/api/admin/sessions?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const parsed = await parseAdminJsonResponse<{ ok?: boolean; error?: string }>(response);
      if (!parsed.ok) {
        setMessage(parsed.error);
        return;
      }
      if (!response.ok) {
        setMessage(parsed.data.error || "Unable to end session.");
        return;
      }
      setMessage("Session ended.");
      await load();
    } catch {
      setMessage("Unable to end session.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Session management</h1>
        <p className="mt-2 text-sm text-slate-600">
          See who is signed in, which IP they used, and when they last were active. When another
          approved admin signs in, you will see a banner across the dashboard.
        </p>
        {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">IP address</th>
              <th className="px-4 py-3">Signed in</th>
              <th className="px-4 py-3">Last active</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-slate-500">
                  Loading sessions…
                </td>
              </tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-slate-500">
                  No tracked sessions yet. Sign in again with GitHub to start recording sessions.
                </td>
              </tr>
            ) : (
              sessions.map((session) => {
                const isCurrent = session.id === currentSessionId;
                return (
                  <tr key={session.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900">
                        {session.displayName}
                        {isCurrent ? (
                          <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                            You
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-slate-500">{session.email}</p>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-700">{session.ipAddress}</td>
                    <td className="px-4 py-4 text-slate-700">{formatWhen(session.loginAt)}</td>
                    <td className="px-4 py-4 text-slate-700">{formatWhen(session.lastSeenAt)}</td>
                    <td className="px-4 py-4">
                      {isCurrent ? (
                        <span className="text-xs text-slate-500">Current browser</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void revokeSession(session.id)}
                          className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          End session
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
