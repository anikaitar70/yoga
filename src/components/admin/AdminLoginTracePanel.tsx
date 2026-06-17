"use client";

import { useEffect, useState } from "react";
import { getLoginTrace, type LoginTraceEntry } from "@/lib/login-trace";

export default function AdminLoginTracePanel() {
  const [entries, setEntries] = useState<LoginTraceEntry[]>([]);

  useEffect(() => {
    const refresh = () => setEntries(getLoginTrace());
    refresh();
    window.addEventListener("login-trace-update", refresh);
    return () => window.removeEventListener("login-trace-update", refresh);
  }, []);

  if (process.env.NODE_ENV === "production") return null;
  if (entries.length === 0) {
    return (
      <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        Login trace: waiting for action (click Sign in)…
      </p>
    );
  }

  return (
    <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-slate-300 bg-slate-900 px-3 py-2 font-mono text-[10px] text-green-300">
      <p className="mb-1 font-sans text-xs font-semibold text-slate-300">Login trace (newest last)</p>
      {entries.map((entry, index) => (
        <div key={`${entry.at}-${index}`} className="border-t border-slate-700 py-1">
          <span className="text-slate-400">{entry.at.slice(11, 19)}</span> {entry.step}
          {entry.data ? (
            <pre className="mt-0.5 whitespace-pre-wrap break-all text-green-200">
              {JSON.stringify(entry.data)}
            </pre>
          ) : null}
        </div>
      ))}
    </div>
  );
}
