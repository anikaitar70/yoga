"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { DiagnosticCategory } from "@prisma/client";
import { adminJsonRequest } from "@/lib/admin-fetch";
import type { DiagnosticEventRow } from "@/lib/diagnostic-events";

const AGE_PRESETS = [7, 30, 60, 90] as const;

type SectionData = {
  key: DiagnosticCategory;
  title: string;
  events: DiagnosticEventRow[];
  total: number;
};

type Props = {
  sections: SectionData[];
  page: number;
  totalPages: number;
};

function formatMetadata(metadata: Record<string, unknown> | null): string {
  if (!metadata) return "—";
  const parts = Object.entries(metadata).map(([key, value]) => `${key}: ${String(value)}`);
  return parts.join(" · ") || "—";
}

async function countDelete(payload: Record<string, unknown>) {
  return adminJsonRequest<{ count: number }>("/api/admin/diagnostics/events", "POST", {
    action: "count",
    ...payload,
  });
}

async function runDelete(payload: Record<string, unknown>) {
  return adminJsonRequest<{ deleted: number; expectedCount: number }>(
    "/api/admin/diagnostics/events",
    "POST",
    payload,
  );
}

export function DiagnosticsErrorsPanel({ sections, page, totalPages }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [customDays, setCustomDays] = useState("30");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const allEventIds = useMemo(
    () => sections.flatMap((section) => section.events.map((event) => event.id)),
    [sections],
  );

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function confirmAndDelete(label: string, payload: Record<string, unknown>) {
    setBusy(true);
    setMessage(null);
    try {
      const preview = await countDelete(payload);
      const confirmed = window.confirm(
        `${label}\n\nThis will permanently delete ${preview.count} diagnostic record(s). This cannot be undone.`,
      );
      if (!confirmed) return;

      const result = await runDelete(payload);
      setSelectedIds(new Set());
      setMessage(`Deleted ${result.deleted} diagnostic record(s).`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Application Diagnostics</h1>
            <p className="mt-2 text-sm text-slate-600">
              Recent operational issues recorded from existing application error points.
            </p>
          </div>
          <Link
            href="/admin/diagnostics"
            className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Back to diagnostics
          </Link>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Cleanup tools</h2>
        <p className="mt-1 text-sm text-slate-600">
          Remove old diagnostic entries to keep this page manageable. A confirmation shows how many
          records will be affected before anything is deleted.
        </p>
        {message ? <p className="mt-3 text-sm font-medium text-slate-800">{message}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || selectedIds.size === 0}
            onClick={() =>
              void confirmAndDelete("Delete selected diagnostics?", {
                mode: "selected",
                ids: Array.from(selectedIds),
              })
            }
            className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
          >
            Delete selected ({selectedIds.size})
          </button>
          {AGE_PRESETS.map((days) => (
            <button
              key={days}
              type="button"
              disabled={busy}
              onClick={() =>
                void confirmAndDelete(`Delete diagnostics older than ${days} days?`, {
                  mode: "olderThan",
                  days,
                })
              }
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              Older than {days} days
            </button>
          ))}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600" htmlFor="diag-custom-days">
              Custom age (days)
            </label>
            <input
              id="diag-custom-days"
              type="number"
              min={1}
              max={3650}
              value={customDays}
              onChange={(event) => setCustomDays(event.target.value)}
              className="w-20 rounded-xl border border-slate-300 px-2 py-1 text-sm"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                const days = Number(customDays);
                if (!Number.isFinite(days) || days < 1) {
                  setMessage("Enter a valid number of days.");
                  return;
                }
                void confirmAndDelete(`Delete diagnostics older than ${days} days?`, {
                  mode: "olderThan",
                  days,
                });
              }}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
            >
              Delete older
            </button>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void confirmAndDelete("Delete ALL diagnostic records?", { mode: "all" })}
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
          >
            Delete all diagnostics
          </button>
        </div>
      </section>

      {sections.map((section) => (
        <section key={section.key} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
          {section.events.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">No recent events.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-3 py-2 font-medium">
                      <input
                        type="checkbox"
                        aria-label={`Select all ${section.title}`}
                        checked={section.events.every((event) => selectedIds.has(event.id))}
                        onChange={(event) => {
                          setSelectedIds((current) => {
                            const next = new Set(current);
                            for (const row of section.events) {
                              if (event.target.checked) next.add(row.id);
                              else next.delete(row.id);
                            }
                            return next;
                          });
                        }}
                      />
                    </th>
                    <th className="px-3 py-2 font-medium">Timestamp</th>
                    <th className="px-3 py-2 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {section.events.map((event) => (
                    <tr key={event.id} className="border-b border-slate-100 align-top">
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(event.id)}
                          onChange={() => toggleSelected(event.id)}
                          aria-label={`Select diagnostic ${event.id}`}
                        />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-slate-600">
                        {new Date(event.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-slate-900">
                        <p>{event.message}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatMetadata(event.metadata)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}

      <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-600">
          Page {page} of {totalPages} · {allEventIds.length} event(s) on this page
        </p>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link
              href={`/admin/diagnostics/errors?page=${page - 1}`}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Previous
            </Link>
          ) : null}
          {page < totalPages ? (
            <Link
              href={`/admin/diagnostics/errors?page=${page + 1}`}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Next
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
