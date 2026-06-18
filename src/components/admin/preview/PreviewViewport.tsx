"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  PREVIEW_DESKTOP_ASPECT_RATIO,
  PREVIEW_VIEWPORT_LABELS,
  PREVIEW_VIEWPORT_WIDTHS,
  type PreviewViewportMode,
} from "@/lib/preview-viewport";
import { cn } from "@/lib/utils";

type PreviewViewportProps = {
  mode: PreviewViewportMode;
  onModeChange: (mode: PreviewViewportMode) => void;
  children: ReactNode;
  className?: string;
  maxHeight?: string;
  compact?: boolean;
  showToggle?: boolean;
  desktopVirtualWidth?: number;
  /** Desktop canvas aspect ratio (width / height). Default 18:9. */
  aspectRatio?: number;
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
  desktopVirtualWidth = 1440,
  aspectRatio = PREVIEW_DESKTOP_ASPECT_RATIO,
}: PreviewViewportProps) {
  const widthPx = PREVIEW_VIEWPORT_WIDTHS[mode];
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [hostWidth, setHostWidth] = useState(0);

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

  const desktopWidth = Math.min(hostWidth > 0 ? hostWidth - 16 : desktopVirtualWidth, desktopVirtualWidth);
  const desktopHeight = desktopWidth / aspectRatio;

  const frameStyle: CSSProperties =
    mode === "desktop"
      ? {
          width: `${desktopWidth}px`,
          maxWidth: "100%",
          height: `${desktopHeight}px`,
          aspectRatio: `${aspectRatio}`,
        }
      : { width: widthPx ? `${widthPx}px` : "100%", maxWidth: "100%" };

  return (
    <div className="space-y-3">
      {showToggle ? (
        <PreviewViewportToggle mode={mode} onModeChange={onModeChange} compact={compact} />
      ) : null}
      <div
        ref={hostRef}
        className={cn(
          "flex justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100/80 p-2 sm:p-3",
        )}
        data-preview-mode={mode}
      >
        <div
          className={cn(
            "preview-viewport-canvas relative overflow-x-auto overflow-y-auto bg-background shadow-sm",
            mode !== "desktop" && "border-x border-dashed border-slate-300",
            className,
          )}
          style={{
            ...frameStyle,
            maxHeight: mode === "desktop" ? undefined : maxHeight,
          }}
        >
          {children}
        </div>
      </div>
      {mode === "desktop" ? (
        <p className="text-center text-[11px] text-slate-500">
          Preview frame · 18:9 · {Math.round(desktopWidth)}×{Math.round(desktopHeight)}px
        </p>
      ) : null}
    </div>
  );
}
