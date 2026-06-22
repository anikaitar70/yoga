"use client";

import type { ReactNode } from "react";
import { DesignSettingsProvider } from "@/components/design/DesignSettingsProvider";
import type { DesignSettings } from "@/lib/design-settings";

/** Page-level design tokens — overrides global settings within program/about pages. */
export function ProgramPageDesignScope({
  settings,
  children,
}: {
  settings: DesignSettings;
  children: ReactNode;
}) {
  return (
    <DesignSettingsProvider settings={settings} applyToDocument={false}>
      {children}
    </DesignSettingsProvider>
  );
}
