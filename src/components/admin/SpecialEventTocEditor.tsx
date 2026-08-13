"use client";

import { useMemo, useState } from "react";
import { adminJsonRequest } from "@/lib/admin-fetch";
import type { AdminEventPageSection } from "@/lib/admin-types";
import {
  buildAutomaticTocItems,
  type SpecialEventTocItem,
  type SpecialEventTocMode,
  type SpecialEventTocOverride,
} from "@/lib/event-page-section";

type Props = {
  eventId: string;
  sections: AdminEventPageSection[];
  initialMode: SpecialEventTocMode;
  initialOverride: SpecialEventTocOverride | null;
  onSaved?: () => void;
};

export function SpecialEventTocEditor({
  eventId,
  sections,
  initialMode,
  initialOverride,
  onSaved,
}: Props) {
  const [mode, setMode] = useState<SpecialEventTocMode>(initialMode);
  const [items, setItems] = useState<SpecialEventTocItem[]>(
    initialOverride?.items ??
      buildAutomaticTocItems(
        sections.map((section) => ({
          ...section,
          sectionType: section.sectionType as AdminEventPageSection["sectionType"] & never,
        })),
      ),
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const automaticPreview = useMemo(
    () =>
      buildAutomaticTocItems(
        sections.map((section) => ({
          ...section,
          sectionType: section.sectionType as never,
        })),
      ),
    [sections],
  );

  async function saveToc() {
    setBusy(true);
    setMessage(null);
    try {
      await adminJsonRequest(`/api/events/${eventId}/special-event-toc`, "PUT", {
        specialEventTocMode: mode,
        specialEventTocOverride:
          mode === "CUSTOM"
            ? {
                items: items.map((item, index) => ({ ...item, sortOrder: index })),
              }
            : null,
      });
      setMessage("Table of contents saved.");
      onSaved?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save table of contents.");
    } finally {
      setBusy(false);
    }
  }

  function switchToCustom() {
    setMode("CUSTOM");
    setItems(automaticPreview);
  }

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Table of contents</h3>
        <p className="mt-1 text-sm text-slate-600">
          Automatic mode follows published section titles. Custom mode lets you override labels and order without
          changing section content.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-sm font-medium ${mode === "AUTOMATIC" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
          onClick={() => setMode("AUTOMATIC")}
        >
          Automatic
        </button>
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-sm font-medium ${mode === "CUSTOM" ? "bg-slate-900 text-white" : "border border-slate-300"}`}
          onClick={switchToCustom}
        >
          Custom
        </button>
      </div>

      {mode === "AUTOMATIC" ? (
        <ol className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          {automaticPreview.length === 0 ? (
            <li>No published sections with titles yet.</li>
          ) : (
            automaticPreview.map((item) => <li key={item.id}>{item.label}</li>)
          )}
        </ol>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr_1fr_auto_auto]">
              <label className="text-sm">
                Label
                <input
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  value={item.label}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, label: event.target.value } : entry,
                      ),
                    )
                  }
                />
              </label>
              <label className="text-sm">
                Target section
                <select
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  value={item.sectionId}
                  onChange={(event) => {
                    const section = sections.find((entry) => entry.id === event.target.value);
                    setItems((current) =>
                      current.map((entry, entryIndex) =>
                        entryIndex === index
                          ? {
                              ...entry,
                              sectionId: event.target.value,
                              anchorSlug: section?.anchorSlug ?? entry.anchorSlug,
                            }
                          : entry,
                      ),
                    );
                  }}
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.title || section.anchorSlug}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-end gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={item.visible}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, visible: event.target.checked } : entry,
                      ),
                    )
                  }
                />
                Visible
              </label>
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-2 py-1"
                  disabled={index === 0}
                  onClick={() => {
                    const next = [...items];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    setItems(next);
                  }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-2 py-1"
                  disabled={index === items.length - 1}
                  onClick={() => {
                    const next = [...items];
                    [next[index], next[index + 1]] = [next[index + 1], next[index]];
                    setItems(next);
                  }}
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void saveToc()}
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Save table of contents
        </button>
        {message ? <span className="text-sm text-slate-600">{message}</span> : null}
      </div>
    </div>
  );
}
