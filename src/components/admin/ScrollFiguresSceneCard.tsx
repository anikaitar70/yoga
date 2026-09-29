"use client";

import { useId, useRef, useState } from "react";
import { adminFetch, parseAdminJsonResponse } from "@/lib/admin-fetch";
import { uploadAdminImage } from "@/lib/upload-client";
import type { ScrollFiguresAnimationScene } from "@/components/admin/AnimationSceneManager";
import {
  SCROLL_FIGURES_OFFSET_RANGE,
  SCROLL_FIGURES_OPACITY_RANGE,
  type ScrollFigureImage,
} from "@/lib/animation-scene-types";

const TINT_PRESETS: { label: string; value: string | null }[] = [
  { label: "Original colours", value: null },
  { label: "Sage", value: "#5c6b52" },
  { label: "Terracotta", value: "#c47a5a" },
  { label: "Charcoal", value: "#2a241f" },
  { label: "Ivory", value: "#ebe4d8" },
];

type Tab = "poses" | "appearance";

async function patchScrollFigures(
  sceneId: string,
  patch: {
    images?: ScrollFigureImage[];
    horizontalOffsetPercent?: number;
    opacity?: number;
    tintColor?: string | null;
  },
) {
  const response = await adminFetch(`/api/cms/animation-scenes/${sceneId}`, {
    method: "PATCH",
    body: JSON.stringify({ scrollFigures: patch }),
  });
  return parseAdminJsonResponse<{ scene?: ScrollFiguresAnimationScene; error?: string }>(response);
}

export function ScrollFiguresSceneCard({
  scene,
  onSaved,
}: {
  scene: ScrollFiguresAnimationScene;
  onSaved: (scene: ScrollFiguresAnimationScene) => void;
}) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>("poses");
  const [images, setImages] = useState(scene.config.images);
  const [offsetDraft, setOffsetDraft] = useState(scene.config.horizontalOffsetPercent);
  const [opacityDraft, setOpacityDraft] = useState(scene.config.opacity);
  const [tintDraft, setTintDraft] = useState(scene.config.tintColor);
  const [uploading, setUploading] = useState(false);
  const [savingImages, setSavingImages] = useState(false);
  const [savingAppearance, setSavingAppearance] = useState(false);
  const [posesMessage, setPosesMessage] = useState<string | null>(null);
  const [appearanceMessage, setAppearanceMessage] = useState<string | null>(null);

  async function persistImages(nextImages: ScrollFigureImage[]) {
    setSavingImages(true);
    setPosesMessage(null);
    try {
      const parsed = await patchScrollFigures(scene.id, { images: nextImages });
      if (!parsed.ok || !parsed.data.scene) {
        setPosesMessage(parsed.ok ? parsed.data.error || "Unable to save images." : parsed.error);
        return;
      }
      setImages(parsed.data.scene.config.images);
      onSaved(parsed.data.scene);
    } catch {
      setPosesMessage("Unable to save images.");
    } finally {
      setSavingImages(false);
    }
  }

  async function handleAddFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setPosesMessage(null);
    try {
      const result = await uploadAdminImage(file, "animations");
      if (!result.ok) {
        setPosesMessage(result.details?.join(" ") || result.error);
        return;
      }
      const nextImages = [
        ...images,
        { id: crypto.randomUUID(), url: result.url, order: images.length },
      ];
      await persistImages(nextImages);
    } catch {
      setPosesMessage("Unable to upload image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function removeImage(id: string) {
    const nextImages = images.filter((image) => image.id !== id).map((image, index) => ({ ...image, order: index }));
    await persistImages(nextImages);
  }

  async function moveImage(id: string, direction: "up" | "down") {
    const index = images.findIndex((image) => image.id === id);
    if (index < 0) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;

    const reordered = [...images];
    const [item] = reordered.splice(index, 1);
    reordered.splice(target, 0, item);
    await persistImages(reordered.map((image, i) => ({ ...image, order: i })));
  }

  async function saveAppearance() {
    setSavingAppearance(true);
    setAppearanceMessage(null);
    try {
      const parsed = await patchScrollFigures(scene.id, {
        horizontalOffsetPercent: offsetDraft,
        opacity: opacityDraft,
        tintColor: tintDraft,
      });
      if (!parsed.ok || !parsed.data.scene) {
        setAppearanceMessage(parsed.ok ? parsed.data.error || "Unable to save appearance." : parsed.error);
        return;
      }
      setOffsetDraft(parsed.data.scene.config.horizontalOffsetPercent);
      setOpacityDraft(parsed.data.scene.config.opacity);
      setTintDraft(parsed.data.scene.config.tintColor);
      onSaved(parsed.data.scene);
      setAppearanceMessage("Appearance saved. Changes are live on the public page now.");
    } catch {
      setAppearanceMessage("Unable to save appearance.");
    } finally {
      setSavingAppearance(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-full border border-slate-300 bg-slate-50 p-1">
        {(
          [
            { key: "poses", label: "Poses" },
            { key: "appearance", label: "Appearance" },
          ] as const
        ).map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setTab(option.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              tab === option.key ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-white"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {tab === "poses" ? (
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Poses</h2>
          <p className="mt-1 text-xs text-slate-500">
            The sequence visitors scroll through, top to bottom. Add, remove, or reorder — each change
            saves immediately.
          </p>
          {posesMessage ? <p className="mt-2 text-sm font-medium text-red-700">{posesMessage}</p> : null}

          <ul className="mt-3 space-y-2">
            {images.map((image, index) => (
              <li
                key={image.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <img
                  src={image.url}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 bg-white object-contain"
                />
                <span className="min-w-0 flex-1 truncate text-xs text-slate-500">{image.url}</span>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    disabled={savingImages || index === 0}
                    onClick={() => void moveImage(image.id, "up")}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-30"
                    aria-label="Move earlier in the sequence"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={savingImages || index === images.length - 1}
                    onClick={() => void moveImage(image.id, "down")}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-30"
                    aria-label="Move later in the sequence"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    disabled={savingImages}
                    onClick={() => void removeImage(image.id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-30"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
            {images.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-slate-300 px-3 py-4 text-center text-xs text-slate-500">
                No poses yet — the figure layer stays hidden on the public page until at least one is
                added.
              </li>
            ) : null}
          </ul>

          <label
            htmlFor={inputId}
            className={`mt-3 inline-flex cursor-pointer items-center justify-center rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 ${
              uploading || savingImages ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {uploading ? "Uploading…" : "Add pose image"}
          </label>
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            accept="image/png,image/webp,image/gif"
            className="sr-only"
            disabled={uploading || savingImages}
            onChange={(event) => void handleAddFile(event.target.files?.[0])}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Horizontal position —{" "}
              {offsetDraft > 0
                ? `${offsetDraft}% right`
                : offsetDraft < 0
                  ? `${Math.abs(offsetDraft)}% left`
                  : "centered"}
            </span>
            <input
              type="range"
              min={SCROLL_FIGURES_OFFSET_RANGE.min}
              max={SCROLL_FIGURES_OFFSET_RANGE.max}
              step={1}
              value={offsetDraft}
              onChange={(event) => setOffsetDraft(Number(event.target.value))}
              className="mt-2 w-full accent-slate-900"
            />
            <span className="mt-1 block text-xs text-slate-500">
              Drag to the far left or right to pin the figures flush against that edge of the screen.
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Translucency — {Math.round(opacityDraft * 100)}%
            </span>
            <input
              type="range"
              min={SCROLL_FIGURES_OPACITY_RANGE.min}
              max={SCROLL_FIGURES_OPACITY_RANGE.max}
              step={0.01}
              value={opacityDraft}
              onChange={(event) => setOpacityDraft(Number(event.target.value))}
              className="mt-2 w-full accent-slate-900"
            />
            <span className="mt-1 block text-xs text-slate-500">
              How visible the figures are at rest. They already brighten slightly on their own where a
              card would otherwise hide them.
            </span>
          </label>

          <div>
            <span className="text-sm font-medium text-slate-700">Tint colour</span>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {TINT_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setTintDraft(preset.value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    tintDraft === preset.value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {preset.value ? (
                    <span
                      className="h-3 w-3 rounded-full border border-black/10"
                      style={{ backgroundColor: preset.value }}
                    />
                  ) : null}
                  {preset.label}
                </button>
              ))}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <input
                  type="color"
                  value={tintDraft ?? "#5c6b52"}
                  onChange={(event) => setTintDraft(event.target.value)}
                  className="h-4 w-4 cursor-pointer border-none bg-transparent p-0"
                />
                Custom
              </label>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Paints a flat colour through each pose&apos;s own silhouette shape. &quot;Original
              colours&quot; leaves the uploaded artwork untouched.
            </p>
          </div>

          <button
            type="button"
            disabled={savingAppearance}
            onClick={() => void saveAppearance()}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {savingAppearance ? "Saving…" : "Save appearance"}
          </button>
          {appearanceMessage ? <p className="mt-2 text-sm text-slate-700">{appearanceMessage}</p> : null}
        </div>
      )}
    </div>
  );
}
