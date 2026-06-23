"use client";

import { useState } from "react";
import { BrandingProvider } from "@/components/branding/BrandingProvider";
import { DesignSettingsProvider } from "@/components/design/DesignSettingsProvider";
import { PreviewViewport } from "@/components/admin/preview/PreviewViewport";
import { HeroSectionView } from "@/components/home/HeroSectionView";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StudioContactLinks } from "@/components/content/StudioContactLinks";
import type { HeroContent, SiteContact } from "@/content/types";
import type { DesignSettings } from "@/lib/design-settings";
import type { SiteBranding } from "@/lib/site-branding";
import { PREVIEW_NAVIGATION } from "@/lib/site-navigation";
import type { PreviewViewportMode, PreviewZoomLevel } from "@/lib/preview-viewport";

type DesignSettingsPreviewProps = {
  designSettings: DesignSettings;
  branding: SiteBranding;
  hero: HeroContent;
  contact: SiteContact;
  siteName: string;
};

export function DesignSettingsPreview({
  designSettings,
  branding,
  hero,
  contact,
  siteName,
}: DesignSettingsPreviewProps) {
  const [viewport, setViewport] = useState<PreviewViewportMode>("desktop");
  const [zoom, setZoom] = useState<PreviewZoomLevel>(1);

  return (
    <div className="flex min-h-[700px] flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start">
      <div className="mb-4 shrink-0">
        <h2 className="text-lg font-semibold text-slate-900">Live preview</h2>
        <p className="text-xs text-slate-500">Updates instantly — uses the same header and hero as the live site</p>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <BrandingProvider branding={branding}>
          <DesignSettingsProvider settings={designSettings} applyToDocument={false}>
            <PreviewViewport
              mode={viewport}
              onModeChange={setViewport}
              zoom={zoom}
              onZoomChange={setZoom}
              showZoomControls
              minHeight="700px"
            >
              <div className="min-h-full bg-background">
                <SiteHeader name={siteName} navigation={PREVIEW_NAVIGATION} interactive={false} />
                <HeroSectionView hero={hero} preview />
                <section className="border-t border-border/50 px-6 py-10">
                  <h3 className="font-display text-foreground [font-size:var(--ds-size-heading,2rem)]">
                    Contact preview
                  </h3>
                  <div className="mt-4">
                    <StudioContactLinks contact={contact} labeled />
                  </div>
                </section>
              </div>
            </PreviewViewport>
          </DesignSettingsProvider>
        </BrandingProvider>
      </div>
    </div>
  );
}
