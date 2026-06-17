"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  PREVIEW_VIEWPORT_LABELS,
  PREVIEW_VIEWPORT_WIDTHS,
  type PreviewViewportMode,
} from "@/lib/preview-viewport";
import { cn } from "@/lib/utils";

type PreviewViewportProps = {
  mode: PreviewViewportMode;
  onModeChange: (mode: PreviewViewportMode) => void;
  children: ReactNode;
  /** Extra classes on the scrollable preview canvas */
  className?: string;
  /** Max height for the preview scroll area (admin panel) */
  maxHeight?: string;
  compact?: boolean;
  /** When false, only render the canvas (toggle rendered elsewhere) */
  showToggle?: boolean;
  /** Virtual desktop width used for proportional scaling in admin. */
  desktopVirtualWidth?: number;
  /** Optional zoom multiplier (1 = 100%). */
  zoom?: number;
};

export function PreviewViewportToggle({
  mode,
  onModeChange,
  compact = false,
}: Pick<PreviewViewportProps, "mode" | "onModeChange" | "compact">) {
  return (
    <div
      className={cn(
        "inline-flex rounded-full border p-1",
        compact ? "border-amber-300 bg-white" : "border-slate-300 bg-slate-50",
      )}
      role="group"
      aria-label="Preview device width"
    >
      {(Object.keys(PREVIEW_VIEWPORT_WIDTHS) as PreviewViewportMode[]).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onModeChange(key)}
          className={cn(
            "rounded-full font-semibold transition-colors",
            compact ? "px-3 py-1.5 text-xs" : "px-3.5 py-1.5 text-xs",
            mode === key
              ? "bg-slate-900 text-white"
              : compact
                ? "text-amber-950 hover:bg-amber-100"
                : "text-slate-700 hover:bg-white",
          )}
        >
          {PREVIEW_VIEWPORT_LABELS[key]}
        </button>
      ))}
    </div>
  );
}

export function PreviewViewport({
  mode,
  onModeChange,
  children,
  className,
  maxHeight = "min(85vh, 900px)",
  compact = false,
  showToggle = true,
  desktopVirtualWidth = 1280,
  zoom = 1,
}: PreviewViewportProps) {
  const widthPx = PREVIEW_VIEWPORT_WIDTHS[mode];

  const hostRef = useRef<HTMLDivElement | null>(null);
  const [hostWidth, setHostWidth] = useState<number>(0);

  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setHostWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const desktopScale = useMemo(() => {
    if (mode !== "desktop") return 1;
    if (!hostWidth) return zoom;
    // Keep some breathing room so the preview doesn't feel pinned to the border.
    const available = Math.max(0, hostWidth - 24);
    const fitScale = desktopVirtualWidth ? available / desktopVirtualWidth : 1;
    return Math.min(1, fitScale) * zoom;
  }, [desktopVirtualWidth, hostWidth, mode, zoom]);

  const frameStyle: CSSProperties =
    mode === "desktop"
      ? { width: "100%", maxWidth: "100%" }
      : { width: widthPx ? `${widthPx}px` : "100%", maxWidth: "100%" };

  return (
    <div className="space-y-3">
      {showToggle ? (
        <PreviewViewportToggle mode={mode} onModeChange={onModeChange} compact={compact} />
      ) : null}
      <div
        ref={hostRef}
        className={cn(
          "flex justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100/80",
          mode === "desktop" ? "p-2 sm:p-3" : "p-3 sm:p-4",
        )}
        data-preview-mode={mode}
      >
        <div
          className={cn(
            "preview-viewport-canvas relative overflow-x-hidden overflow-y-auto bg-background transition-[width,transform] duration-200 ease-out",
            mode !== "desktop" && "border-x border-dashed border-slate-300 shadow-md",
            className,
          )}
          style={{ ...frameStyle, maxHeight }}
        >
          {mode === "desktop" ? (
            <div className="flex justify-center">
              <div
                style={{
                  width: `${desktopVirtualWidth * desktopScale}px`,
                }}
              >
                <div
                  style={{
                    width: `${desktopVirtualWidth}px`,
                    transform: `scale(${desktopScale})`,
                    transformOrigin: "top left",
                  }}
                >
                  {children}
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
