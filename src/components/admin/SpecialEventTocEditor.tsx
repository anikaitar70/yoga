"use client";

import { useMemo, useState } from "react";
import { adminJsonRequest } from "@/lib/admin-fetch";
import type { AdminEventPageSection } from "@/lib/admin-types";
import {
  buildAutomaticTocItems,
  type SpecialEventTocDesign,
  type SpecialEventTocItem,
  type SpecialEventTocMode,
  type SpecialEventTocOverride,
} from "@/lib/event-page-section";
import { SITE_FONT_CHOICES, type SiteFontId } from "@/lib/site-fonts";

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
  const [design, setDesign] = useState<SpecialEventTocDesign | null>(initialOverride?.design ?? null);
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
      const compactDesign = design && Object.values(design).some((v) => typeof v === "string" && v.trim())
        ? Object.fromEntries(Object.entries(design).filter(([, v]) => typeof v === "string" && (v as string).trim()))
        : null;
      await adminJsonRequest(`/api/events/${eventId}/special-event-toc`, "PUT", {
        specialEventTocMode: mode,
        specialEventTocOverride:
          mode === "CUSTOM"
            ? {
                items: items.map((item, index) => ({ ...item, sortOrder: index })),
                design: compactDesign,
              }
            : // Automatic mode can still carry design so it applies even without custom items
              compactDesign
              ? { items: buildAutomaticTocItems(sections.map((s) => ({ ...s, sectionType: s.sectionType as never }))), design: compactDesign }
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

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-800">TOC font design</p>
        <p className="text-xs text-slate-500">Applies to the “On this page” title and links — works in both Automatic and Custom modes.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Font family
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              value={design?.fontFamily ?? ""}
              onChange={(e) => setDesign((prev) => ({ ...(prev ?? {}), fontFamily: (e.target.value || undefined) as SiteFontId | undefined }))}
            >
              <option value="">Default</option>
              {SITE_FONT_CHOICES.map((choice) => (
                <option key={choice.id} value={choice.id}>{choice.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Font weight
            <select
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              value={design?.fontWeight ?? ""}
              onChange={(e) => setDesign((prev) => ({ ...(prev ?? {}), fontWeight: e.target.value || undefined }))}
            >
              <option value="">Default</option>
              <option value="300">300 Light</option>
              <option value="400">400 Regular</option>
              <option value="500">500 Medium</option>
              <option value="600">600 Semibold</option>
              <option value="700">700 Bold</option>
            </select>
          </label>
          <label className="text-sm">
            Font size
            <input
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
              placeholder="e.g. 16px"
              value={design?.fontSize ?? ""}
              onChange={(e) => setDesign((prev) => ({ ...(prev ?? {}), fontSize: e.target.value || undefined }))}
            />
          </label>
          <label className="text-sm">
            Text color
            <div className="mt-1 flex gap-2">
              <input type="color" value={design?.color ?? "#2a241f"} onChange={(e) => setDesign((prev) => ({ ...(prev ?? {}), color: e.target.value }))} className="h-10 w-12 rounded border" />
              <input className="flex-1 rounded-xl border border-slate-300 px-3 py-2" placeholder="#2a241f" value={design?.color ?? ""} onChange={(e) => setDesign((prev) => ({ ...(prev ?? {}), color: e.target.value || undefined }))} />
            </div>
          </label>
          <label className="text-sm">
            Font style
            <select className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2" value={design?.fontStyle ?? ""} onChange={(e) => setDesign((prev) => ({ ...(prev ?? {}), fontStyle: (e.target.value || undefined) as SpecialEventTocDesign["fontStyle"] }))}>
              <option value="">Default</option>
              <option value="normal">Normal</option>
              <option value="italic">Italic</option>
            </select>
          </label>
          <label className="text-sm">
            Underline
            <select className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2" value={design?.textDecoration ?? ""} onChange={(e) => setDesign((prev) => ({ ...(prev ?? {}), textDecoration: (e.target.value || undefined) as SpecialEventTocDesign["textDecoration"] }))}>
              <option value="">Default</option>
              <option value="none">None</option>
              <option value="underline">Underline</option>
            </select>
          </label>
          <label className="text-sm">
            Highlight
            <div className="mt-1 flex gap-2">
              <input type="color" value={design?.highlightColor ?? "#ffff00"} onChange={(e) => setDesign((prev) => ({ ...(prev ?? {}), highlightColor: e.target.value }))} className="h-10 w-12 rounded border" />
              <input className="flex-1 rounded-xl border border-slate-300 px-3 py-2" placeholder="#ffff00" value={design?.highlightColor ?? ""} onChange={(e) => setDesign((prev) => ({ ...(prev ?? {}), highlightColor: e.target.value || undefined }))} />
            </div>
          </label>
          <label className="text-sm">
            Alignment
            <select className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2" value={design?.textAlign ?? ""} onChange={(e) => setDesign((prev) => ({ ...(prev ?? {}), textAlign: (e.target.value || undefined) as SpecialEventTocDesign["textAlign"] }))}>
              <option value="">Default</option>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
          <label className="text-sm">
            Line height
            <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="e.g. 1.6" value={design?.lineHeight ?? ""} onChange={(e) => setDesign((prev) => ({ ...(prev ?? {}), lineHeight: e.target.value || undefined }))} />
          </label>
          <label className="text-sm">
            Letter spacing
            <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="e.g. 0.5px" value={design?.letterSpacing ?? ""} onChange={(e) => setDesign((prev) => ({ ...(prev ?? {}), letterSpacing: e.target.value || undefined }))} />
          </label>
          <label className="text-sm">
            Item spacing
            <select className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2" value={design?.itemSpacing ?? ""} onChange={(e) => setDesign((prev) => ({ ...(prev ?? {}), itemSpacing: (e.target.value || undefined) as SpecialEventTocDesign["itemSpacing"] }))}>
              <option value="">Default (normal)</option>
              <option value="compact">Compact (4px)</option>
              <option value="normal">Normal (8px)</option>
              <option value="relaxed">Relaxed (16px)</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          {design?.itemSpacing === "custom" ? (
            <label className="text-sm">
              Custom spacing
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="e.g. 12px" value={design?.itemSpacingCustom ?? ""} onChange={(e) => setDesign((prev) => ({ ...(prev ?? {}), itemSpacingCustom: e.target.value || undefined }))} />
            </label>
          ) : null}
          <label className="text-sm md:col-span-2">
            Container background
            <div className="mt-1 flex gap-2">
              <input type="color" value={design?.background ?? "#f5f0e8"} onChange={(e) => setDesign((prev) => ({ ...(prev ?? {}), background: e.target.value }))} className="h-10 w-12 rounded border" />
              <input className="flex-1 rounded-xl border border-slate-300 px-3 py-2" placeholder="leave empty for default" value={design?.background ?? ""} onChange={(e) => setDesign((prev) => ({ ...(prev ?? {}), background: e.target.value || undefined }))} />
            </div>
          </label>
        </div>
        {design && Object.values(design).some((v) => typeof v === "string" && v.trim()) ? (
          <button type="button" className="text-xs text-slate-600 underline" onClick={() => setDesign(null)}>Reset to default</button>
        ) : null}
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
