"use client";

import { TimelineStyleEditor } from "@/components/admin/TimelineStyleEditor";
import type { TimelineStyleSettings } from "@/lib/timeline-style";

type PreviewTimelineStylePanelProps = {
  sectionTitle: string | null;
  style: TimelineStyleSettings;
  busy: boolean;
  onChange: (style: TimelineStyleSettings) => void;
  onSave: () => void;
  onReset: () => void;
};

export function PreviewTimelineStylePanel({
  sectionTitle,
  style,
  busy,
  onChange,
  onSave,
  onReset,
}: PreviewTimelineStylePanelProps) {
  return (
    <div className="border-b border-slate-200 bg-white p-4">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Timeline styling</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {sectionTitle ? `"${sectionTitle}"` : "Selected section"}
        </p>
        <p className="mt-1 text-xs text-slate-500">Updates the preview instantly. Save to persist.</p>
      </div>

      <TimelineStyleEditor
        style={style}
        scope="section"
        showScope={false}
        compact
        onStyleChange={onChange}
        onScopeChange={() => undefined}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onSave}
          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          Save timeline style
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onReset}
          className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
