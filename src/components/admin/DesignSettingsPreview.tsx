"use client";

import { useState } from "react";
import { BrandingProvider } from "@/components/branding/BrandingProvider";
import { DesignSettingsProvider } from "@/components/design/DesignSettingsProvider";
import { PreviewViewport } from "@/components/admin/preview/PreviewViewport";
import { HeroSectionView } from "@/components/home/HeroSectionView";
import { StudioContactLinks } from "@/components/content/StudioContactLinks";
import { BrandLogo } from "@/components/ui/BrandLogo";
import type { HeroContent, SiteContact } from "@/content/types";
import type { DesignSettings } from "@/lib/design-settings";
import type { SiteBranding } from "@/lib/site-branding";
import type { PreviewViewportMode } from "@/lib/preview-viewport";
import { cn } from "@/lib/utils";

type DesignSettingsPreviewProps = {
  designSettings: DesignSettings;
  branding: SiteBranding;
  hero: HeroContent;
  contact: SiteContact;
  siteName: string;
};

function HeaderPreview({
  designSettings,
  siteName,
}: {
  designSettings: DesignSettings;
  siteName: string;
}) {
  const { headerLayout } = designSettings;
  const logoStyle = {
    marginLeft: `${headerLayout.leftOffsetPx}px`,
    marginRight: `${headerLayout.rightOffsetPx}px`,
    transform:
      headerLayout.alignment === "custom"
        ? `translateX(${headerLayout.customOffsetX}px)`
        : undefined,
  };

  return (
    <header className="border-b border-border/60 bg-background/95 px-4 py-3">
      <div
        className={cn(
          "flex items-center",
          headerLayout.alignment === "center"
            ? "justify-center"
            : headerLayout.alignment === "right"
              ? "justify-end"
              : "justify-between",
        )}
        style={{ gap: `${headerLayout.headerGapPx}px` }}
      >
        <div className="site-nav inline-flex items-center" style={logoStyle}>
          <BrandLogo
            context="navbar"
            widthPx={headerLayout.logoWidthPx > 0 ? headerLayout.logoWidthPx : undefined}
            heightPx={headerLayout.logoHeightPx > 0 ? headerLayout.logoHeightPx : undefined}
          />
        </div>
        {headerLayout.alignment !== "center" ? (
          <nav className="site-nav hidden gap-4 sm:flex">
            <span>About</span>
            <span>Yoga</span>
            <span>Contact</span>
          </nav>
        ) : null}
        <span className="sr-only">{siteName}</span>
      </div>
    </header>
  );
}

export function DesignSettingsPreview({
  designSettings,
  branding,
  hero,
  contact,
  siteName,
}: DesignSettingsPreviewProps) {
  const [viewport, setViewport] = useState<PreviewViewportMode>("desktop");

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Live preview</h2>
        <p className="text-xs text-slate-500">Updates instantly — no save required</p>
      </div>

      <BrandingProvider branding={branding}>
        <DesignSettingsProvider settings={designSettings}>
          <PreviewViewport mode={viewport} onModeChange={setViewport} maxHeight="min(70vh, 720px)">
            <div className="min-h-full bg-background">
              <HeaderPreview designSettings={designSettings} siteName={siteName} />
              <HeroSectionView hero={hero} />
              <section className="border-t border-border/50 px-6 py-10">
                <h3 className="font-display text-xl text-foreground">Contact preview</h3>
                <div className="mt-4">
                  <StudioContactLinks contact={contact} labeled />
                </div>
              </section>
            </div>
          </PreviewViewport>
        </DesignSettingsProvider>
      </BrandingProvider>
    </div>
  );
}
