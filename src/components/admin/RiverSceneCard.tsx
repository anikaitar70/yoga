"use client";

import { useState } from "react";
import { adminFetch, parseAdminJsonResponse } from "@/lib/admin-fetch";
import type { RiverAnimationScene } from "@/components/admin/AnimationSceneManager";

function SpeedSlider({
  label,
  hint,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label} — {value}
        {unit}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full accent-slate-900"
      />
      <span className="mt-1 block text-xs text-slate-500">{hint}</span>
    </label>
  );
}

export function RiverSceneCard({
  scene,
  onSaved,
}: {
  scene: RiverAnimationScene;
  onSaved: (scene: RiverAnimationScene) => void;
}) {
  const [draft, setDraft] = useState(scene.speed);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function saveSpeed() {
    setSaving(true);
    setMessage(null);
    try {
      const response = await adminFetch(`/api/cms/animation-scenes/${scene.id}`, {
        method: "PATCH",
        body: JSON.stringify({ speed: draft }),
      });
      const parsed = await parseAdminJsonResponse<{ scene?: RiverAnimationScene; error?: string }>(response);
      if (!parsed.ok || !response.ok || !parsed.data.scene) {
        setMessage(parsed.ok ? parsed.data.error || "Unable to save speed settings." : parsed.error);
        return;
      }
      onSaved(parsed.data.scene);
      setDraft(parsed.data.scene.speed);
      setMessage("Speed settings saved. Changes are live on the public page now.");
    } catch {
      setMessage("Unable to save speed settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-slate-900">Speed</h2>

      <SpeedSlider
        label="Ambient speed"
        hint="How fast it drifts while the visitor is just reading, not scrolling. Keep this low."
        value={draft.speedAmbient}
        min={1}
        max={40}
        step={1}
        unit=" px/s"
        onChange={(value) => setDraft((prev) => ({ ...prev, speedAmbient: value }))}
      />

      <SpeedSlider
        label="Scroll boost"
        hint="How much faster it moves while the visitor scrolls, relative to ambient speed. Higher = more responsive to scrolling."
        value={draft.scrollMultiplier}
        min={0}
        max={5}
        step={0.1}
        unit="x"
        onChange={(value) => setDraft((prev) => ({ ...prev, scrollMultiplier: value }))}
      />

      <SpeedSlider
        label="Max speed"
        hint="Hard ceiling on how fast it can ever go, however quickly the visitor scrolls (as a multiple of ambient speed)."
        value={draft.speedMax}
        min={1}
        max={10}
        step={0.1}
        unit="x"
        onChange={(value) => setDraft((prev) => ({ ...prev, speedMax: value }))}
      />

      <div>
        <span className="text-sm font-medium text-slate-700">Direction</span>
        <div className="mt-2 inline-flex rounded-full border border-slate-300 bg-slate-50 p-1">
          {(["downstream", "upstream"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDraft((prev) => ({ ...prev, direction: option }))}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                draft.direction === option ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-white"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() => void saveSpeed()}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save speed settings"}
      </button>

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}
