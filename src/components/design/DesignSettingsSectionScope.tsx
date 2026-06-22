"use client";

import { useMemo } from "react";
import { DesignSettingsProvider, useDesignSettings } from "@/components/design/DesignSettingsProvider";
import {
  mergeDesignSettings,
  type DesignSettingsOverride,
} from "@/lib/design-settings";

type DesignSettingsSectionScopeProps = {
  overrides?: DesignSettingsOverride | null;
  children: React.ReactNode;
};

/** Applies optional section-level design overrides on top of global settings. */
export function DesignSettingsSectionScope({
  overrides,
  children,
}: DesignSettingsSectionScopeProps) {
  const global = useDesignSettings();
  const resolved = useMemo(
    () => (overrides ? mergeDesignSettings(global, overrides) : global),
    [global, overrides],
  );

  if (!overrides) {
    return children;
  }

  return (
    <DesignSettingsProvider settings={resolved} applyToDocument={false}>
      {children}
    </DesignSettingsProvider>
  );
}
