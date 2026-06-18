import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { getUploadRootDir } from "@/lib/env";
import { recordDiagnosticEvent } from "@/lib/app-diagnostics";
import { MAX_UPLOAD_BYTES } from "@/lib/upload-limits";
import { generateImageVariants, imageVariantFilenames } from "@/lib/image-variants";
import { isUploadSection, type UploadSection } from "@/lib/upload-sections";

export { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB, UPLOAD_FILE_HINT } from "@/lib/upload-limits";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export type UploadValidationResult =
  | { ok: true; buffer: Buffer; extension: string }
  | { ok: false; error: string };

export function validateImageFile(file: File, buffer: Buffer): UploadValidationResult {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      ok: false,
      error: "Invalid file type. Use JPEG, PNG, WebP, or GIF.",
    };
  }

  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `File is too large. Maximum size is ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB.`,
    };
  }

  const extension = EXTENSION_BY_MIME[file.type];
  if (!extension) {
    return { ok: false, error: "Unsupported image format." };
  }

  return { ok: true, buffer, extension };
}

function slugifyFilename(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function buildUploadFilename(originalName: string, extension: string): string {
  const slug = slugifyFilename(originalName) || "image";
  const unique = randomBytes(4).toString("hex");
  const timestamp = Date.now();
  return `${slug}-${timestamp}-${unique}.${extension}`;
}

export function getUploadDir(section: UploadSection, subfolder?: string): string {
  const base = path.join(getUploadRootDir(), section);
  if (!subfolder) {
    return base;
  }
  const safe = subfolder.replace(/[^a-z0-9-]/gi, "").slice(0, 48);
  return safe ? path.join(base, safe) : base;
}

export function getPublicUploadUrl(section: UploadSection, filename: string, subfolder?: string): string {
  const safe = subfolder?.replace(/[^a-z0-9-]/gi, "").slice(0, 48);
  return safe ? `/uploads/${section}/${safe}/${filename}` : `/uploads/${section}/${filename}`;
}

export type SavedImageUrls = {
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  width?: number;
  height?: number;
};

export async function saveUploadedImage(
  section: UploadSection,
  buffer: Buffer,
  filename: string,
  subfolder?: string,
): Promise<string> {
  const result = await saveUploadedImageWithVariants(section, buffer, filename, subfolder);
  return result.url;
}

/** Gallery uploads get thumbnail + medium + full WebP variants for progressive loading. */
export async function saveUploadedImageWithVariants(
  section: UploadSection,
  buffer: Buffer,
  filename: string,
  subfolder?: string,
): Promise<SavedImageUrls> {
  const dir = getUploadDir(section, subfolder);
  await fs.mkdir(dir, { recursive: true });

  if (section === "gallery") {
    try {
      const variants = await generateImageVariants(buffer);
      const names = imageVariantFilenames(filename);
      await Promise.all([
        fs.writeFile(path.join(dir, names.full), variants.full),
        fs.writeFile(path.join(dir, names.medium), variants.medium),
        fs.writeFile(path.join(dir, names.thumbnail), variants.thumbnail),
      ]);
      return {
        url: getPublicUploadUrl(section, names.full, subfolder),
        mediumUrl: getPublicUploadUrl(section, names.medium, subfolder),
        thumbnailUrl: getPublicUploadUrl(section, names.thumbnail, subfolder),
        width: variants.width,
        height: variants.height,
      };
    } catch (error) {
      recordDiagnosticEvent("IMAGE_PROCESSING_FAILURE", "Gallery image processing failed", {
        file: filename,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  await fs.writeFile(path.join(dir, filename), buffer);
  return { url: getPublicUploadUrl(section, filename, subfolder) };
}

/** Only delete files under public/uploads — prevents path traversal. */
export async function deleteUploadByUrl(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith("/uploads/")) {
    return;
  }

  const normalized = path.normalize(url).replace(/\\/g, "/");
  if (!normalized.startsWith("/uploads/") || normalized.includes("..")) {
    return;
  }

  const parts = normalized.slice("/uploads/".length).split("/");
  if (parts.length < 2 || parts.length > 3) {
    return;
  }

  const [section, ...rest] = parts;
  if (!isUploadSection(section)) {
    return;
  }

  const filePath =
    rest.length === 2
      ? path.join(getUploadDir(section, rest[0]), rest[1])
      : path.join(getUploadDir(section), rest[0]);
  try {
    await fs.unlink(filePath);
  } catch {
    // File may already be gone — safe to ignore.
  }
}
