"use client";

import { useEffect } from "react";

export function LegacyWebkitDetect() {
  useEffect(() => {
    try {
      const legacy =
        typeof window === "undefined" ||
        !window.CSS ||
        !CSS.supports ||
        !CSS.supports("color", "color-mix(in srgb, red, blue)");
      if (legacy) document.documentElement.classList.add("legacy-webkit");
    } catch {
      document.documentElement.classList.add("legacy-webkit");
    }
  }, []);
  return null;
}
