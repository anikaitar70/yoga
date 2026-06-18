"use client";

import Image from "next/image";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { BrandingProvider } from "@/components/branding/BrandingProvider";
import {
  BRAND_LABELS,
  type BrandKey,
  type SiteBranding,
  shouldUnoptimizeLogoSrc,
} from "@/lib/site-branding";

type BrandingEditorProps = {
  value: SiteBranding;
  onChange: (branding: SiteBranding) => void;
  /** Persists branding to the server immediately after a logo upload succeeds. */
  onLogoSave?: (branding: SiteBranding, brand: BrandKey) => Promise<void>;
};

const BRAND_KEYS: BrandKey[] = ["nirvanaYoga", "justArtAffaire"];

function BrandPreviewCard({
  brand,
  branding,
}: {
  brand: BrandKey;
  branding: SiteBranding;
}) {
  return (
    <BrandingProvider branding={branding}>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Live preview</p>
        <div className="mt-3 flex flex-wrap items-end gap-6">
          <div>
            <p className="mb-2 text-xs text-slate-500">Navbar</p>
            <BrandLogo brand={brand} context="navbar" />
          </div>
          <div>
            <p className="mb-2 text-xs text-slate-500">Footer</p>
            <BrandLogo brand={brand} context="footer" />
          </div>
          <div>
            <p className="mb-2 text-xs text-slate-500">Hero</p>
            <BrandLogo brand={brand} context="hero" />
          </div>
        </div>
      </div>
    </BrandingProvider>
  );
}

export function BrandingEditor({ value, onChange, onLogoSave }: BrandingEditorProps) {
  function updateBrand(brand: BrandKey, patch: Partial<SiteBranding[BrandKey]>) {
    onChange({
      ...value,
      [brand]: { ...value[brand], ...patch },
    });
  }

  async function handleLogoChange(brand: BrandKey, logoSrc: string) {
    const next: SiteBranding = {
      ...value,
      [brand]: { ...value[brand], logoSrc },
    };
    onChange(next);
    if (onLogoSave) {
      await onLogoSave(next, brand);
    }
  }

  return (
    <div className="space-y-8">
      {BRAND_KEYS.map((brand) => (
        <div key={brand} className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">{BRAND_LABELS[brand]}</h3>
          <p className="mt-1 text-xs text-amber-800">
            Logos are saved to the site automatically when upload finishes.
          </p>
          <div className="mt-4 space-y-4">
            <ImageUploadField
              label="Logo"
              section="branding"
              brandKey={brand}
              value={value[brand].logoSrc}
              onChange={(logoSrc) => void handleLogoChange(brand, logoSrc)}
              hint="PNG, JPG, WebP, or SVG. Shown in navigation, footer, hero, and admin."
            />
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Logo scale ({value[brand].logoScale.toFixed(2)}×)
              </span>
              <input
                type="range"
                min={0.5}
                max={4}
                step={0.05}
                value={value[brand].logoScale}
                onChange={(event) =>
                  updateBrand(brand, { logoScale: Number(event.target.value) })
                }
                className="mt-2 w-full accent-slate-900"
              />
              <span className="mt-1 block text-xs text-slate-500">
                Affects navbar, footer, mobile menu, hero, and admin sidebar.
              </span>
            </label>
            <BrandPreviewCard brand={brand} branding={value} />
            {value[brand].logoSrc ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
                <Image
                  key={value[brand].logoSrc}
                  src={value[brand].logoSrc}
                  alt={`${BRAND_LABELS[brand]} logo asset`}
                  width={320}
                  height={80}
                  className="h-auto max-h-16 w-auto max-w-full object-contain"
                  unoptimized={shouldUnoptimizeLogoSrc(value[brand].logoSrc)}
                />
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
