"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, parseAdminJsonResponse } from "@/lib/admin-fetch";
import { RiverSceneCard } from "@/components/admin/RiverSceneCard";
import { ScrollFiguresSceneCard } from "@/components/admin/ScrollFiguresSceneCard";
import type { ScrollFiguresSceneConfig } from "@/lib/animation-scene-types";

type RiverSpeed = {
  speedAmbient: number;
  scrollMultiplier: number;
  speedMax: number;
  direction: "downstream" | "upstream";
};

type SceneBase = {
  id: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
};

export type RiverAnimationScene = SceneBase & { kind: "river"; speed: RiverSpeed };
export type ScrollFiguresAnimationScene = SceneBase & { kind: "scrollFigures"; config: ScrollFiguresSceneConfig };
export type AnyAnimationScene = RiverAnimationScene | ScrollFiguresAnimationScene;

export function AnimationSceneManager() {
  const [scenes, setScenes] = useState<AnyAnimationScene[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminFetch("/api/cms/animation-scenes");
      const parsed = await parseAdminJsonResponse<{ scenes: AnyAnimationScene[] }>(response);
      if (!parsed.ok) {
        setMessage(parsed.error);
        return;
      }
      setScenes(parsed.data.scenes);
      setMessage(null);
    } catch {
      setMessage("Unable to load animation scenes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function updateScene(updated: AnyAnimationScene) {
    setScenes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }

  async function toggleScene(scene: AnyAnimationScene) {
    setSavingId(scene.id);
    setMessage(null);
    try {
      const response = await adminFetch(`/api/cms/animation-scenes/${scene.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isEnabled: !scene.isEnabled }),
      });
      const parsed = await parseAdminJsonResponse<{ scene?: AnyAnimationScene; error?: string }>(response);
      if (!parsed.ok || !response.ok || !parsed.data.scene) {
        setMessage(parsed.ok ? parsed.data.error || "Unable to update." : parsed.error);
        return;
      }
      updateScene(parsed.data.scene);
      setMessage(`${parsed.data.scene.name}: ${parsed.data.scene.isEnabled ? "enabled" : "disabled"}.`);
    } catch {
      setMessage("Unable to update.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Animations</h1>
        <p className="mt-2 text-sm text-slate-600">
          Turn decorative page animations on or off, and tune how they move.
        </p>
        {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
      </div>

      {loading ? (
        <p className="rounded-3xl border border-slate-200 bg-white px-6 py-8 text-sm text-slate-500 shadow-sm">
          Loading…
        </p>
      ) : scenes.length === 0 ? (
        <p className="rounded-3xl border border-slate-200 bg-white px-6 py-8 text-sm text-slate-500 shadow-sm">
          No animation scenes yet.
        </p>
      ) : (
        scenes.map((scene) => (
          <div key={scene.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="font-medium text-slate-900">{scene.name}</p>
                {scene.description ? <p className="text-xs text-slate-500">{scene.description}</p> : null}
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={scene.isEnabled}
                disabled={savingId === scene.id}
                onClick={() => void toggleScene(scene)}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                  scene.isEnabled ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    scene.isEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="px-6 py-5">
              {scene.kind === "river" ? (
                <RiverSceneCard scene={scene} onSaved={updateScene} />
              ) : (
                <ScrollFiguresSceneCard scene={scene} onSaved={updateScene} />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
