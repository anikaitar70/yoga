/**
 * Canonical production environment variables.
 * APP_URL drives metadata, redirects, and absolute links — change domain via env only.
 */
export function getAppUrl(): string {
  const raw =
    process.env.APP_URL ??
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://nirvanayoga.org";
  return raw.replace(/\/$/, "");
}

/** Directory where uploaded images are stored (must be writable). */
export function getUploadRootDir(): string {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (configured) return configured;
  return `${process.cwd()}/public/uploads`;
}
