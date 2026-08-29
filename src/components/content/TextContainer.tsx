import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { TextContainerSettings } from "@/lib/section-layout";

type TextContainerProps = {
  settings?: TextContainerSettings | null;
  children: ReactNode;
  className?: string;
  /** When true, renders as a card-like container (rounded, padded). */
  variant?: "block" | "inline";
};

export function resolveTextContainerStyle(
  settings?: TextContainerSettings | null,
): CSSProperties | undefined {
  if (!settings || !settings.mode || settings.mode === "auto" || settings.mode === "none") {
    return undefined;
  }
  const style: CSSProperties = {};
  if (settings.mode === "solid" && settings.color) {
    style.backgroundColor = settings.color;
  }
  if (settings.mode === "image" && settings.imageUrl) {
    style.backgroundImage = `url(${settings.imageUrl})`;
    (style as Record<string, string>).backgroundSize = "cover";
    (style as Record<string, string>).backgroundPosition = "center";
    (style as Record<string, string>).backgroundRepeat = "no-repeat";
  }
  return Object.keys(style).length > 0 ? style : undefined;
}

export function resolveTextContainerClasses(
  settings?: TextContainerSettings | null,
  defaultClasses?: string,
): string | undefined {
  if (!settings || !settings.mode || settings.mode === "auto") return defaultClasses;
  if (settings.mode === "none") return "bg-transparent border-transparent shadow-none";
  if (settings.mode === "solid" || settings.mode === "image") {
    // Keep structural spacing/border but override background.
    // Caller should merge with base padding/border.
    return undefined;
  }
  return defaultClasses;
}

export function TextContainer({ settings, children, className, variant = "block" }: TextContainerProps) {
  const mode = settings?.mode ?? "auto";
  if (mode === "auto") {
    return <div className={className}>{children}</div>;
  }

  const style = resolveTextContainerStyle(settings);
  const base =
    mode === "none"
      ? "bg-transparent"
      : mode === "solid"
        ? "rounded-xl p-6"
        : "rounded-xl p-6 bg-cover bg-center";

  return (
    <div className={cn(base, className)} style={style}>
      {children}
    </div>
  );
}

export const TEXT_CONTAINER_MODE_LABELS: Record<NonNullable<TextContainerSettings["mode"]>, string> = {
  auto: "Auto (default)",
  none: "None / Transparent",
  solid: "Solid colour",
  image: "Image",
};

export const TEXT_CONTAINER_MODES = ["auto", "none", "solid", "image"] as const;
