"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { uploadAdminImage } from "@/lib/upload-client";
import { shouldUnoptimizeLogoSrc, type BrandKey } from "@/lib/site-branding";
import type { UploadSection } from "@/lib/upload-sections";

export type ImageUploadMeta = {
  thumbnailUrl?: string;
  mediumUrl?: string;
  width?: number;
  height?: number;
};

interface ImageUploadFieldProps {
  label: string;
  section: UploadSection;
  value: string;
  onChange: (url: string, meta?: ImageUploadMeta) => void;
  hint?: string;
  brandKey?: BrandKey;
}

export default function ImageUploadField({
  label,
  section,
  value,
  onChange,
  hint,
  brandKey,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [previewBroken, setPreviewBroken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveReminder =
    "After removing or replacing an image, click the section Save button to update the live site.";

  useEffect(() => {
    setPreviewBroken(false);
  }, [value]);

  useEffect(() => {
    if (!uploading) {
      setProcessing(false);
      return;
    }
    const timer = window.setTimeout(() => setProcessing(true), 4000);
    return () => window.clearTimeout(timer);
  }, [uploading]);

  async function handleFileChange(file: File | undefined) {
    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await uploadAdminImage(file, section, value || null, null, brandKey);
      if (!result.ok) {
        setError(result.details?.join(" ") || result.error);
        return;
      }
      onChange(result.url, {
        thumbnailUrl: result.thumbnailUrl,
        mediumUrl: result.mediumUrl,
        width: result.width,
        height: result.height,
      });
    } catch {
      setError("Unable to upload image. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleRemove() {
    onChange("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      <p className="text-xs text-slate-500">{saveReminder}</p>

      {value ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {previewBroken ? (
            <div className="flex aspect-[16/9] max-h-48 w-full items-center justify-center bg-slate-100 px-4 text-center text-xs text-slate-500">
              Preview unavailable (file missing on server). Replace the image below.
            </div>
          ) : (
            <div className="relative aspect-[16/9] max-h-48 w-full">
              <Image
                key={value}
                src={value}
                alt="Current upload preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
                unoptimized={shouldUnoptimizeLogoSrc(value)}
                onError={() => setPreviewBroken(true)}
              />
            </div>
          )}
          <p className="truncate px-3 py-2 text-xs text-slate-500">{value}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <label
          htmlFor={inputId}
          className={`inline-flex cursor-pointer items-center justify-center rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 ${
            uploading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {uploading
            ? processing && section === "gallery"
              ? "Processing image…"
              : "Uploading…"
            : value
              ? "Replace image"
              : "Upload image"}
        </label>
        {uploading && processing && section === "gallery" ? (
          <p className="text-xs text-slate-500" role="status">
            Large photos can take up to a minute while WebP variants are generated. Please wait.
          </p>
        ) : null}
        {value ? (
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
          >
            Remove
          </button>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="sr-only"
        disabled={uploading}
        onChange={(event) => handleFileChange(event.target.files?.[0])}
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
