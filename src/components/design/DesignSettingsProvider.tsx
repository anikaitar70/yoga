"use client";

import { createContext, useContext } from "react";
import {
  DEFAULT_DESIGN_SETTINGS,
  type DesignSettings,
  designSettingsToCssVariables,
} from "@/lib/design-settings";
import { GoogleFontsLink } from "@/components/design/GoogleFontsLink";

const DesignSettingsContext = createContext<DesignSettings>(DEFAULT_DESIGN_SETTINGS);

export function DesignSettingsProvider({
  settings,
  children,
}: {
  settings: DesignSettings;
  children: React.ReactNode;
}) {
  const cssVars = designSettingsToCssVariables(settings);

  return (
    <DesignSettingsContext.Provider value={settings}>
      <GoogleFontsLink settings={settings} />
      <div className="design-settings-root contents" style={cssVars}>
        {children}
      </div>
    </DesignSettingsContext.Provider>
  );
}

export function useDesignSettings(): DesignSettings {
  return useContext(DesignSettingsContext);
}
