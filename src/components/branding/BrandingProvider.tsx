"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteBranding } from "@/lib/site-branding";
import { DEFAULT_SITE_BRANDING } from "@/lib/site-branding";

const BrandingContext = createContext<SiteBranding>(DEFAULT_SITE_BRANDING);

type BrandingProviderProps = {
  branding: SiteBranding;
  children: ReactNode;
};

export function BrandingProvider({ branding, children }: BrandingProviderProps) {
  return (
    <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>
  );
}

export function useSiteBranding(): SiteBranding {
  return useContext(BrandingContext);
}
