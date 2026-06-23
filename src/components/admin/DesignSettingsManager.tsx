"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandingEditor } from "@/components/admin/BrandingEditor";
import { FontSizeControl } from "@/components/admin/FontSizeControl";
import { DesignSettingsPreview } from "@/components/admin/DesignSettingsPreview";
import { SiteBackgroundPicker } from "@/components/admin/SiteBackgroundPicker";
import type { HeroContent, SiteConfig } from "@/content/types";
import { adminJsonRequest } from "@/lib/admin-fetch";
import {
  HEADER_ALIGNMENT_LABELS,
  HERO_LOGO_ALIGNMENT_LABELS,
  parseDesignSettings,
  type DesignColorSettings,
  type DesignSettings,
  type HeaderAlignment,
  type HeroLogoAlignment,
  type TypographyRole,
} from "@/lib/design-settings";
import { DEFAULT_SITE_BACKGROUND, type SiteBackgroundVariant } from "@/lib/site-background";
import { SITE_FONT_CHOICES } from "@/lib/site-fonts";
import { BRAND_LABELS, type BrandKey, type SiteBranding } from "@/lib/site-branding";
import { cn } from "@/lib/utils";

type DesignTab = "typography" | "colors" | "header" | "hero";

const TABS: { id: DesignTab; label: string }[] = [
  { id: "typography", label: "Typography" },
  { id: "colors", label: "Colors" },
  { id: "header", label: "Header layout" },
  { id: "hero", label: "Hero layout" },
];

const BRAND_COLOR_KEYS: Array<keyof DesignColorSettings> = ["primary", "accent"];
const TEXT_COLOR_KEYS: Array<keyof DesignColorSettings> = ["background", "foreground", "muted"];

const COLOR_LABELS: Record<keyof DesignColorSettings, string> = {
  primary: "Primary brand color",
  accent: "Accent color",
  background: "Page background",
  foreground: "Main text color",
  muted: "Secondary text color",
};

const inputClass = "mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm";
const labelClass = "block text-sm font-medium text-slate-700";

type DesignSettingsManagerProps = {
  site: SiteConfig;
  hero: HeroContent;
};

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </div>
  );
}

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

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={labelClass}>
      {label}
      <input
        type="color"
        className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function DesignSettingsManager({ site, hero }: DesignSettingsManagerProps) {
  const router = useRouter();
  const [tab, setTab] = useState<DesignTab>("typography");
  const [designSettings, setDesignSettings] = useState<DesignSettings>(
    parseDesignSettings(site.designSettings ?? null),
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

  function patchNavigationStyling(
    patch: Partial<DesignSettings["navigationStyling"]>,
  ) {
    setDesignSettings((current) => ({
      ...current,
      navigationStyling: { ...current.navigationStyling, ...patch },
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
        designSettings: parseDesignSettings(designSettings),
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

  function renderTypographyRole(role: Exclude<TypographyRole, "navigation">, title: string) {
    const settings = designSettings.typography[role];
    const defaultSize =
      role === "headings" ? "52px" : role === "body" ? "16px" : "14px";

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
                  fontFamily: e.target.value as DesignSettings["typography"][typeof role]["fontFamily"],
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
          <FontSizeControl
            className="sm:col-span-2"
            value={settings.fontSize}
            fallback={defaultSize}
            onChange={(fontSize) => patchTypography(role, { fontSize })}
          />
          <ColorField
            label="Font color"
            value={settings.color}
            onChange={(color) => patchTypography(role, { color })}
          />
        </div>
      </div>
    );
  }

  function renderNavigationStyling() {
    const navType = designSettings.typography.navigation;
    const navColors = designSettings.navigationStyling;

    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="font-semibold text-slate-900">Navigation styling</h3>
        <p className="mt-1 text-sm text-slate-600">
          All menu bar typography and link colors in one place.
        </p>

        <div className="mt-5">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Typography</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className={labelClass}>
              Font family
              <select
                className={inputClass}
                value={navType.fontFamily}
                onChange={(e) =>
                  patchTypography("navigation", {
                    fontFamily: e.target.value as DesignSettings["typography"]["navigation"]["fontFamily"],
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
                value={navType.fontWeight}
                onChange={(e) => patchTypography("navigation", { fontWeight: e.target.value })}
              >
                {["300", "400", "500", "600", "700"].map((weight) => (
                  <option key={weight} value={weight}>
                    {weight}
                  </option>
                ))}
              </select>
            </label>
            <FontSizeControl
              className="sm:col-span-2"
              value={navType.fontSize}
              fallback="14px"
              onChange={(fontSize) => patchTypography("navigation", { fontSize })}
            />
            <label className={labelClass}>
              Letter spacing
              <input
                className={inputClass}
                value={navType.letterSpacing ?? ""}
                onChange={(e) => patchTypography("navigation", { letterSpacing: e.target.value })}
                placeholder="0.01em"
              />
            </label>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Link colors</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <ColorField
              label="Link color"
              value={navColors.linkColor}
              onChange={(linkColor) => patchNavigationStyling({ linkColor })}
            />
            <ColorField
              label="Hover color"
              value={navColors.hoverColor}
              onChange={(hoverColor) => patchNavigationStyling({ hoverColor })}
            />
            <ColorField
              label="Active page color"
              value={navColors.activeColor}
              onChange={(activeColor) => patchNavigationStyling({ activeColor })}
            />
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Optional</h4>
          <p className="mt-1 text-xs text-slate-500">
            Leave blank to use the default header appearance.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <ColorField
                label="Navigation bar background"
                value={navColors.backgroundColor ?? designSettings.colors.background}
                onChange={(backgroundColor) => patchNavigationStyling({ backgroundColor })}
              />
              {navColors.backgroundColor ? (
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-slate-600 underline"
                  onClick={() => patchNavigationStyling({ backgroundColor: undefined })}
                >
                  Use default background
                </button>
              ) : null}
            </div>
            <div>
              <ColorField
                label="Navigation bar border"
                value={navColors.borderColor ?? designSettings.colors.muted}
                onChange={(borderColor) => patchNavigationStyling({ borderColor })}
              />
              {navColors.borderColor ? (
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-slate-600 underline"
                  onClick={() => patchNavigationStyling({ borderColor: undefined })}
                >
                  Use default border
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Design settings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Typography, colors, header, and hero layout. Changes preview live on the right — click Save when finished.
        </p>
        {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
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
              {renderNavigationStyling()}
              {renderTypographyRole("buttons", "Buttons")}
            </div>
          ) : null}

          {tab === "colors" ? (
            <div className="space-y-4">
              <SettingsSection
                title="Brand colors"
                description="Buttons, accents, and highlights across the site."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {BRAND_COLOR_KEYS.map((key) => (
                    <ColorField
                      key={key}
                      label={COLOR_LABELS[key]}
                      value={designSettings.colors[key]}
                      onChange={(value) =>
                        patchDesign({
                          colors: { ...designSettings.colors, [key]: value },
                        })
                      }
                    />
                  ))}
                </div>
              </SettingsSection>

              <SettingsSection
                title="Text colors"
                description="Page background and default text tones."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {TEXT_COLOR_KEYS.map((key) => (
                    <ColorField
                      key={key}
                      label={COLOR_LABELS[key]}
                      value={designSettings.colors[key]}
                      onChange={(value) =>
                        patchDesign({
                          colors: { ...designSettings.colors, [key]: value },
                        })
                      }
                    />
                  ))}
                </div>
              </SettingsSection>

              <SettingsSection
                title="Selection colors"
                description="Colors shown when visitors highlight text on the page."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <ColorField
                    label="Selection background"
                    value={designSettings.selectionStyling.background}
                    onChange={(background) =>
                      patchDesign({
                        selectionStyling: {
                          ...designSettings.selectionStyling,
                          background,
                        },
                      })
                    }
                  />
                  <ColorField
                    label="Selection text"
                    value={designSettings.selectionStyling.text}
                    onChange={(text) =>
                      patchDesign({
                        selectionStyling: {
                          ...designSettings.selectionStyling,
                          text,
                        },
                      })
                    }
                  />
                </div>
              </SettingsSection>

              <SettingsSection
                title="Page atmosphere"
                description="Decorative background style behind all pages."
              >
                <SiteBackgroundPicker value={siteBackground} onChange={setSiteBackground} />
              </SettingsSection>
            </div>
          ) : null}

          {tab === "header" ? (
            <div className="space-y-4">
              <SettingsSection
                title="Logo"
                description="Upload logos and adjust size. Logo scale applies in the navigation bar, footer, hero, and admin."
              >
                <BrandingEditor
                  value={branding}
                  onChange={setBranding}
                  onLogoSave={handleBrandingLogoSave}
                />
              </SettingsSection>

              <SettingsSection
                title="Header alignment"
                description="How the logo and menu sit in the top bar."
              >
                <div className="grid gap-4 sm:grid-cols-2">
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
              </SettingsSection>

              <SettingsSection
                title="Navigation position"
                description="Fine-tune spacing around the logo and between menu links."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <SliderField
                    label="Space between menu links"
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
                  <SliderField
                    label="Logo left margin"
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
                    label="Logo right margin"
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
                </div>
              </SettingsSection>
            </div>
          ) : null}

          {tab === "hero" ? (
            <div className="space-y-4">
              <SettingsSection
                title="Hero logo alignment"
                description="Positions the Nirvana Yoga logo above the homepage headline."
              >
                <label className={`${labelClass} block max-w-sm`}>
                  Logo alignment
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
              </SettingsSection>

              <SettingsSection
                title="Hero typography"
                description="The homepage headline uses your Headings settings from the Typography tab."
              >
                <p className="text-sm text-slate-600">
                  To change the hero title font, size, or color, open{" "}
                  <strong>Typography → Headings</strong>.
                </p>
              </SettingsSection>

              <SettingsSection
                title="Hero spacing"
                description="Padding and section height are tuned in the homepage preview studio."
              >
                <p className="text-sm text-slate-600">
                  For hero padding and image height, open{" "}
                  <strong>CMS → Preview studio → Homepage</strong> and select the hero section.
                </p>
              </SettingsSection>
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
