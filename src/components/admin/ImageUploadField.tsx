"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { uploadAdminImage } from "@/lib/upload-client";
import { shouldUnoptimizeLogoSrc } from "@/lib/site-branding";
import type { UploadSection } from "@/lib/upload-sections";

interface ImageUploadFieldProps {
  label: string;
  section: UploadSection;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}

export default function ImageUploadField({
  label,
  section,
  value,
  onChange,
  hint,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(file: File | undefined) {
    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await uploadAdminImage(file, section, value || null);
      if (!result.ok) {
        setError(result.details?.join(" ") || result.error);
        return;
      }
      onChange(result.url);
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

      {value ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <div className="relative aspect-[16/9] max-h-48 w-full">
            <Image
              key={value}
              src={value}
              alt="Current upload preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized={shouldUnoptimizeLogoSrc(value)}
            />
          </div>
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
          {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
        </label>
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
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        disabled={uploading}
        onChange={(event) => handleFileChange(event.target.files?.[0])}
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
