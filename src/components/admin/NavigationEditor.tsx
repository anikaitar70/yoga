"use client";

import { useState } from "react";
import { HelpIcon } from "@/components/help/HelpIcon";

export type NavItem = { label: string; href: string };

type Props = {
  value: NavItem[];
  onChange: (items: NavItem[]) => void;
};

export function NavigationEditor({ value, onChange }: Props) {
  const [items, setItems] = useState<NavItem[]>(value);

  function sync(next: NavItem[]) {
    setItems(next);
    onChange(next);
  }

  function update(index: number, patch: Partial<NavItem>) {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    sync(next);
  }

  function add() {
    sync([...items, { label: "", href: "" }]);
  }

  function remove(index: number) {
    const next = items.filter((_, i) => i !== index);
    sync(next);
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const tmp = next[index]!;
    next[index] = next[target]!;
    next[target] = tmp!;
    sync(next);
  }

  // Keep internal in sync if parent value changes from outside (e.g. after save)
  // Use derived check: if parent value differs and this render is not stale
  if (value.length !== items.length || value.some((v, i) => v.label !== items[i]?.label || v.href !== items[i]?.href)) {
    // Only sync if user is not actively typing empty new row? Compare simplest: if lengths differ or content differs, adopt parent
    // Avoid infinite loop by directly setting when mismatch detected outside of event cycle
    // We use a micro-task level check: schedule sync for next render if parent is newer
    // For simplicity, adopt parent when items is not mid-edit with same length but different content after save
    // If parent has been saved with trimmed values, update local
    const needsSync = value.length === 0 || items.length === 0 || JSON.stringify(value) !== JSON.stringify(items);
    if (needsSync && JSON.stringify(value) !== JSON.stringify(items)) {
      // Defer to avoid setState during render
      queueMicrotask(() => setItems(value));
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">
          Navigation links <HelpIcon sectionId="navigation-menu" title="Navigation help" />
        </p>
        <span className="text-xs text-slate-500">{items.length} item{items.length === 1 ? "" : "s"}</span>
      </div>
      <p className="text-xs leading-5 text-slate-600">
        Reorder with ↑↓. Label is the text visitors see (English). Href is the destination — use <code className="rounded bg-white px-1 py-0.5">/yoga</code>, <code className="rounded bg-white px-1 py-0.5">/events</code>, or a full <code className="rounded bg-white px-1 py-0.5">https://…</code>. Blank rows are ignored on save.
      </p>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_1fr_auto]">
            <label className="block text-xs font-medium text-slate-700">
              Label
              <input
                value={item.label}
                onChange={(e) => update(index, { label: e.target.value })}
                placeholder="Yoga"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-medium text-slate-700">
              Link (href)
              <input
                value={item.href}
                onChange={(e) => update(index, { href: e.target.value })}
                placeholder="/yoga or https://…"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </label>
            <div className="flex items-end gap-1">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs disabled:opacity-40" aria-label="Move up">
                ↑
              </button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs disabled:opacity-40" aria-label="Move down">
                ↓
              </button>
              <button type="button" onClick={() => remove(index)} className="rounded-lg border border-red-200 bg-red-50 px-2 py-2 text-xs font-semibold text-red-700" aria-label="Remove">
                ✕
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">No navigation items — click Add to create the first link.</p> : null}
      </div>

      <button type="button" onClick={add} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        + Add link
      </button>
      <p className="text-xs text-slate-500">Click <span className="font-semibold">Save site config</span> below to apply changes to the live header and hamburger menu.</p>
    </div>
  );
}
