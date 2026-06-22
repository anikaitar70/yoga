"use client";

import { useEffect } from "react";
import type { DesignSettings } from "@/lib/design-settings";
import { buildGoogleFontsHref } from "@/lib/site-fonts";

type GoogleFontsLinkProps = {
  settings: DesignSettings;
  /** Skip injecting fonts (preview scopes inherit from the admin document). */
  disabled?: boolean;
};

export function GoogleFontsLink({ settings, disabled = false }: GoogleFontsLinkProps) {
  const fontKey = [
    settings.typography.headings.fontFamily,
    settings.typography.body.fontFamily,
    settings.typography.navigation.fontFamily,
    settings.typography.buttons.fontFamily,
  ].join("|");

  useEffect(() => {
    if (disabled) return;
    const href = buildGoogleFontsHref([
      settings.typography.headings.fontFamily,
      settings.typography.body.fontFamily,
      settings.typography.navigation.fontFamily,
      settings.typography.buttons.fontFamily,
    ]);

    const existing = document.getElementById("cms-google-fonts");
    if (!href) {
      existing?.remove();
      return;
    }

    if (existing) {
      if (existing.getAttribute("href") === href) return;
      existing.remove();
    }

    const link = document.createElement("link");
    link.id = "cms-google-fonts";
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }, [disabled, fontKey, settings.typography]);

  return null;
}
