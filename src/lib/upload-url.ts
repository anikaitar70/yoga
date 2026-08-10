/** Matches `/uploads/{section}/{file}` and `/uploads/{section}/{subfolder}/{file}`. */
export const LOCAL_UPLOAD_PATH_REGEX = /^\/uploads\/[^/]+(?:\/[^/]+)+$/;

/** User uploads are served directly from /uploads (nginx volume) — bypass next/image optimizer. */
export function isLocalUploadUrl(src: string): boolean {
  return src.startsWith("/uploads/");
}
