"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import {
  DEFAULT_DESIGN_SETTINGS,
  parseDesignSettings,
  type DesignSettings,
  designSettingsToCssVariables,
} from "@/lib/design-settings";
import { GoogleFontsLink } from "@/components/design/GoogleFontsLink";

const DesignSettingsContext = createContext<DesignSettings>(DEFAULT_DESIGN_SETTINGS);

type DesignSettingsProviderProps = {
  settings: DesignSettings;
  /** When true (default), tokens apply on `document.documentElement` for site-wide inheritance. */
  applyToDocument?: boolean;
  children: React.ReactNode;
};

export function DesignSettingsProvider({
  settings,
  applyToDocument = true,
  children,
}: DesignSettingsProviderProps) {
  const normalized = useMemo(() => parseDesignSettings(settings), [settings]);
  const cssVars = useMemo(() => designSettingsToCssVariables(normalized), [normalized]);

  useEffect(() => {
    if (!applyToDocument) return;

    const root = document.documentElement;
    const previous = new Map<string, string>();

    for (const [key, value] of Object.entries(cssVars)) {
      if (typeof value !== "string") continue;
      previous.set(key, root.style.getPropertyValue(key));
      root.style.setProperty(key, value);
    }

    return () => {
      for (const [key, prev] of previous) {
        if (prev) root.style.setProperty(key, prev);
        else root.style.removeProperty(key);
      }
    };
  }, [cssVars, applyToDocument]);

  return (
    <DesignSettingsContext.Provider value={normalized}>
      <GoogleFontsLink settings={normalized} disabled={!applyToDocument} />
      {applyToDocument ? (
        children
      ) : (
        <div className="design-settings-scope min-h-full" style={cssVars}>
          {children}
        </div>
      )}
    </DesignSettingsContext.Provider>
  );
}

export function useDesignSettings(): DesignSettings {
  return useContext(DesignSettingsContext);
}
