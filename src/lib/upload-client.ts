import { adminFetch, parseAdminJsonResponse } from "@/lib/admin-fetch";
import { MAX_UPLOAD_BYTES } from "@/lib/upload-limits";
import type { UploadSection } from "@/lib/upload-sections";
import type { BrandKey } from "@/lib/site-branding";

export type UploadImageResult =
  | {
      ok: true;
      url: string;
      thumbnailUrl?: string;
      mediumUrl?: string;
      width?: number;
      height?: number;
      brandingPersisted?: boolean;
    }
  | { ok: false; error: string; details?: string[] };

export async function uploadAdminImage(
  file: File,
  section: UploadSection,
  replaceUrl?: string | null,
  collectionSlug?: string | null,
  brandKey?: BrandKey | null,
): Promise<UploadImageResult> {
  if (file.size > MAX_UPLOAD_BYTES) {
    const maxMb = MAX_UPLOAD_BYTES / (1024 * 1024);
    return {
      ok: false,
      error: `File is too large. Maximum size is ${maxMb} MB.`,
    };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("section", section);
  if (replaceUrl?.startsWith("/uploads/")) {
    formData.append("replaceUrl", replaceUrl);
  }
  if (collectionSlug) {
    formData.append("collectionSlug", collectionSlug);
  }
  if (brandKey) {
    formData.append("brandKey", brandKey);
  }

  const response = await adminFetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const parsed = await parseAdminJsonResponse<{
    url?: string;
    thumbnailUrl?: string;
    mediumUrl?: string;
    width?: number;
    height?: number;
    brandingPersisted?: boolean;
    error?: string;
    details?: string[];
  }>(response);

  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: parsed.data.error || "Unable to upload image.",
      details: Array.isArray(parsed.data.details) ? parsed.data.details : undefined,
    };
  }

  if (!parsed.data.url) {
    return { ok: false, error: "Upload succeeded but no image URL was returned." };
  }

  return {
    ok: true,
    url: parsed.data.url,
    thumbnailUrl: parsed.data.thumbnailUrl,
    mediumUrl: parsed.data.mediumUrl,
    width: parsed.data.width,
    height: parsed.data.height,
    brandingPersisted: parsed.data.brandingPersisted,
  };
}
