"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandingEditor } from "@/components/admin/BrandingEditor";
import { DesignSettingsPreview } from "@/components/admin/DesignSettingsPreview";
import { SiteBackgroundPicker } from "@/components/admin/SiteBackgroundPicker";
import type { HeroContent, SiteConfig } from "@/content/types";
import { adminJsonRequest } from "@/lib/admin-fetch";
import {
  DEFAULT_DESIGN_SETTINGS,
  HEADER_ALIGNMENT_LABELS,
  HERO_LOGO_ALIGNMENT_LABELS,
  type DesignSettings,
  type HeaderAlignment,
  type HeroLogoAlignment,
  type TypographyRole,
} from "@/lib/design-settings";
import { DEFAULT_SITE_BACKGROUND, type SiteBackgroundVariant } from "@/lib/site-background";
import { SITE_FONT_CHOICES } from "@/lib/site-fonts";
import { BRAND_LABELS, type BrandKey, type SiteBranding } from "@/lib/site-branding";
import { cn } from "@/lib/utils";

type DesignTab = "typography" | "colors" | "header" | "hero" | "navigation";

const TABS: { id: DesignTab; label: string }[] = [
  { id: "typography", label: "Typography" },
  { id: "colors", label: "Colors" },
  { id: "header", label: "Header layout" },
  { id: "hero", label: "Hero layout" },
  { id: "navigation", label: "Navigation" },
];

const inputClass = "mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm";
const labelClass = "block text-sm font-medium text-slate-700";

type DesignSettingsManagerProps = {
  site: SiteConfig;
  hero: HeroContent;
};

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = "px",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <label className={labelClass}>
      {label} ({value}
      {suffix})
      <input
        type="range"
        className="mt-2 w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export function DesignSettingsManager({ site, hero }: DesignSettingsManagerProps) {
  const router = useRouter();
  const [tab, setTab] = useState<DesignTab>("typography");
  const [designSettings, setDesignSettings] = useState<DesignSettings>(
    site.designSettings ?? DEFAULT_DESIGN_SETTINGS,
  );
  const [branding, setBranding] = useState<SiteBranding>(site.branding);
  const [siteBackground, setSiteBackground] = useState<SiteBackgroundVariant>(
    site.siteBackground ?? DEFAULT_SITE_BACKGROUND,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function patchDesign(patch: Partial<DesignSettings>) {
    setDesignSettings((current) => ({ ...current, ...patch }));
  }

  function patchTypography(role: TypographyRole, patch: Partial<DesignSettings["typography"][TypographyRole]>) {
    setDesignSettings((current) => ({
      ...current,
      typography: {
        ...current.typography,
        [role]: { ...current.typography[role], ...patch },
      },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await adminJsonRequest("/api/cms/site", "PUT", {
        name: site.name,
        tagline: site.tagline,
        contactEmail: site.contact.email,
        contactPhone: site.contact.phone,
        contactAddress: site.contact.address,
        navigation: site.navigation,
        social: site.socialConfig,
        branding,
        homepageLayout: {
          ...(site.homepageLayout ?? {}),
          siteBackground,
        },
        designSettings,
      });
      router.refresh();
      setMessage("Design settings saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleBrandingLogoSave(nextBranding: SiteBranding, brand: BrandKey) {
    setBranding(nextBranding);
    await adminJsonRequest("/api/cms/site", "PUT", { branding: nextBranding });
    setMessage(`${BRAND_LABELS[brand]} logo saved.`);
  }

  function renderTypographyRole(
    role: TypographyRole,
    title: string,
    options?: { showSize?: boolean; showLetterSpacing?: boolean },
  ) {
    const settings = designSettings.typography[role];
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            Font family
            <select
              className={inputClass}
              value={settings.fontFamily}
              onChange={(e) =>
                patchTypography(role, {
                  fontFamily: e.target.value as DesignSettings["typography"][TypographyRole]["fontFamily"],
                })
              }
            >
              {SITE_FONT_CHOICES.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Font weight
            <select
              className={inputClass}
              value={settings.fontWeight}
              onChange={(e) => patchTypography(role, { fontWeight: e.target.value })}
            >
              {["300", "400", "500", "600", "700"].map((weight) => (
                <option key={weight} value={weight}>
                  {weight}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Font color
            <input
              type="color"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white"
              value={settings.color}
              onChange={(e) => patchTypography(role, { color: e.target.value })}
            />
          </label>
          {options?.showSize ? (
            <label className={labelClass}>
              Font size
              <input
                className={inputClass}
                value={settings.fontSize ?? ""}
                onChange={(e) => patchTypography(role, { fontSize: e.target.value })}
              />
            </label>
          ) : null}
          {options?.showLetterSpacing ? (
            <label className={labelClass}>
              Letter spacing
              <input
                className={inputClass}
                value={settings.letterSpacing ?? ""}
                onChange={(e) => patchTypography(role, { letterSpacing: e.target.value })}
              />
            </label>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Design settings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Global typography, colors, header layout, hero alignment, and navigation styling. Changes preview live on the right.
        </p>
        {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,42%)]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  tab === item.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "typography" ? (
            <div className="space-y-4">
              {renderTypographyRole("headings", "Headings")}
              {renderTypographyRole("body", "Body text")}
              {renderTypographyRole("navigation", "Navigation", {
                showSize: true,
                showLetterSpacing: true,
              })}
              {renderTypographyRole("buttons", "Buttons", { showSize: true })}
            </div>
          ) : null}

          {tab === "colors" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                Object.keys(designSettings.colors) as Array<keyof DesignSettings["colors"]>
              ).map((key) => (
                <label key={key} className={labelClass}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  <input
                    type="color"
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white"
                    value={designSettings.colors[key]}
                    onChange={(e) =>
                      patchDesign({
                        colors: { ...designSettings.colors, [key]: e.target.value },
                      })
                    }
                  />
                </label>
              ))}
              <div className="sm:col-span-2">
                <SiteBackgroundPicker value={siteBackground} onChange={setSiteBackground} />
              </div>
            </div>
          ) : null}

          {tab === "header" ? (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-semibold text-slate-900">Branding logos</h2>
                <div className="mt-4">
                  <BrandingEditor
                    value={branding}
                    onChange={setBranding}
                    onLogoSave={handleBrandingLogoSave}
                  />
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-semibold text-slate-900">Header layout</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <SliderField
                    label="Logo width (0 = auto)"
                    value={designSettings.headerLayout.logoWidthPx}
                    min={0}
                    max={320}
                    step={4}
                    onChange={(logoWidthPx) =>
                      patchDesign({
                        headerLayout: { ...designSettings.headerLayout, logoWidthPx },
                      })
                    }
                  />
                  <SliderField
                    label="Logo height"
                    value={designSettings.headerLayout.logoHeightPx}
                    min={24}
                    max={120}
                    step={2}
                    onChange={(logoHeightPx) =>
                      patchDesign({
                        headerLayout: { ...designSettings.headerLayout, logoHeightPx },
                      })
                    }
                  />
                  <SliderField
                    label="Left offset"
                    value={designSettings.headerLayout.leftOffsetPx}
                    min={0}
                    max={120}
                    step={2}
                    onChange={(leftOffsetPx) =>
                      patchDesign({
                        headerLayout: { ...designSettings.headerLayout, leftOffsetPx },
                      })
                    }
                  />
                  <SliderField
                    label="Right offset"
                    value={designSettings.headerLayout.rightOffsetPx}
                    min={0}
                    max={120}
                    step={2}
                    onChange={(rightOffsetPx) =>
                      patchDesign({
                        headerLayout: { ...designSettings.headerLayout, rightOffsetPx },
                      })
                    }
                  />
                  <SliderField
                    label="Header gap"
                    value={designSettings.headerLayout.headerGapPx}
                    min={0}
                    max={64}
                    step={2}
                    onChange={(headerGapPx) =>
                      patchDesign({
                        headerLayout: { ...designSettings.headerLayout, headerGapPx },
                      })
                    }
                  />
                  <label className={labelClass}>
                    Alignment
                    <select
                      className={inputClass}
                      value={designSettings.headerLayout.alignment}
                      onChange={(e) =>
                        patchDesign({
                          headerLayout: {
                            ...designSettings.headerLayout,
                            alignment: e.target.value as HeaderAlignment,
                          },
                        })
                      }
                    >
                      {Object.entries(HEADER_ALIGNMENT_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {designSettings.headerLayout.alignment === "custom" ? (
                    <SliderField
                      label="Custom horizontal position"
                      value={designSettings.headerLayout.customOffsetX}
                      min={-200}
                      max={200}
                      step={4}
                      onChange={(customOffsetX) =>
                        patchDesign({
                          headerLayout: { ...designSettings.headerLayout, customOffsetX },
                        })
                      }
                    />
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {tab === "hero" ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-900">Hero logo alignment</h2>
              <p className="mt-1 text-sm text-slate-600">
                Centers the Nirvana Yoga logo above the hero headline by default.
              </p>
              <label className={`${labelClass} mt-4 block max-w-sm`}>
                Hero logo alignment
                <select
                  className={inputClass}
                  value={designSettings.heroLayout.logoAlignment}
                  onChange={(e) =>
                    patchDesign({
                      heroLayout: {
                        logoAlignment: e.target.value as HeroLogoAlignment,
                      },
                    })
                  }
                >
                  {Object.entries(HERO_LOGO_ALIGNMENT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          {tab === "navigation" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                Object.keys(designSettings.navigationStyling) as Array<
                  keyof DesignSettings["navigationStyling"]
                >
              ).map((key) => (
                <label key={key} className={labelClass}>
                  {key.replace(/([A-Z])/g, " $1")}
                  <input
                    type="color"
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white"
                    value={designSettings.navigationStyling[key]}
                    onChange={(e) =>
                      patchDesign({
                        navigationStyling: {
                          ...designSettings.navigationStyling,
                          [key]: e.target.value,
                        },
                      })
                    }
                  />
                </label>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save design settings"}
          </button>
        </div>

        <DesignSettingsPreview
          designSettings={designSettings}
          branding={branding}
          hero={hero}
          contact={site.contact}
          siteName={site.name}
        />
      </div>
    </div>
  );
}
