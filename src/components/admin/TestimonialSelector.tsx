"use client";

import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";

type TestimonialLite = {
  id: string;
  quote: string;
  name: string;
  role: string;
  status: string;
  featured?: boolean;
};

type Scope = "homepage" | "program" | "specialEvent";

type Props = {
  scope: Scope;
  pageType?: string;
  eventId?: string;
  onMessage?: (msg: string | null) => void;
};

function buildUrl(scope: Scope, pageType?: string, eventId?: string) {
  const params = new URLSearchParams({ scope });
  if (pageType) params.set("pageType", pageType);
  if (eventId) params.set("eventId", eventId);
  return `/api/cms/testimonials/selections?${params.toString()}`;
}

export function TestimonialSelector({ scope, pageType, eventId, onMessage }: Props) {
  const [all, setAll] = useState<TestimonialLite[]>([]);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const url = useMemo(() => buildUrl(scope, pageType, eventId), [scope, pageType, eventId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [testimonialsRes, selectionsRes] = await Promise.all([
          adminFetch("/api/cms/testimonials"),
          adminFetch(url),
        ]);
        if (!testimonialsRes.ok || !selectionsRes.ok) {
          if (!cancelled) onMessage?.("Failed to load testimonials");
          return;
        }
        const testimonials: TestimonialLite[] = await testimonialsRes.json();
        const selectionsData: { orderedIds: string[] } = await selectionsRes.json();
        if (!cancelled) {
          setAll(testimonials);
          setOrderedIds(selectionsData.orderedIds ?? []);
        }
      } catch {
        if (!cancelled) onMessage?.("Failed to load testimonials");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [url, onMessage]);

  const selectedSet = new Set(orderedIds);
  const filteredAvailable = all.filter((t) => {
    if (selectedSet.has(t.id)) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      t.quote.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.role.toLowerCase().includes(q)
    );
  });

  const selectedTestimonials = orderedIds
    .map((id) => all.find((t) => t.id === id))
    .filter(Boolean) as TestimonialLite[];

  function add(id: string) {
    setOrderedIds((prev) => [...prev, id]);
  }

  function remove(id: string) {
    setOrderedIds((prev) => prev.filter((x) => x !== id));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= orderedIds.length) return;
    setOrderedIds((prev) => {
      const next = [...prev];
      const tmp = next[index];
      next[index] = next[target]!;
      next[target] = tmp!;
      return next;
    });
  }

  async function save() {
    setSaving(true);
    onMessage?.(null);
    try {
      const res = await adminFetch(url, {
        method: "PUT",
        body: JSON.stringify({ orderedIds }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        onMessage?.(data.error || "Failed to save selections");
        return;
      }
      onMessage?.("Selections saved.");
    } catch {
      onMessage?.("Failed to save selections.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading testimonials…</p>;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">
          {scope === "homepage"
            ? "Homepage testimonials"
            : scope === "program"
              ? `Testimonials for ${pageType}`
              : "Testimonials for this event"}
        </h3>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save order"}
        </button>
      </div>

      {selectedTestimonials.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Selected ({selectedTestimonials.length}) — drag order with ↑↓</p>
          {selectedTestimonials.map((t, index) => (
            <div key={t.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{t.name || "Unnamed"} — {t.role || t.status}</p>
                <p className="truncate text-xs text-slate-500">{t.quote.slice(0, 80)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs disabled:opacity-40"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === selectedTestimonials.length - 1}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs disabled:opacity-40"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(t.id)}
                  className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          No testimonials selected — the public page will use the default/global testimonials.
        </p>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Available</p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search quote, name, role"
            className="w-48 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs"
          />
        </div>
        <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
          {filteredAvailable.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-slate-500">No matches.</p>
          ) : (
            filteredAvailable.slice(0, 50).map((t) => (
              <div key={t.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{t.name || "Unnamed"} · {t.status}</p>
                  <p className="truncate text-xs text-slate-500">{t.quote.slice(0, 70)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => add(t.id)}
                  className="shrink-0 rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                >
                  Add
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
