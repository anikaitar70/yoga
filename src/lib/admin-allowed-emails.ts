const DEFAULT_ALLOWED_EMAILS = ["anikaitar@gmail.com", "nirvanayogaorg@gmail.com"];

const ADMIN_DISPLAY_NAMES: Record<string, string> = {
  "anikaitar@gmail.com": "Anikait",
  "nirvanayogaorg@gmail.com": "Shalini",
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Approved GitHub account emails — configured via ADMIN_ALLOWED_EMAILS (comma-separated). */
export function getAllowedAdminEmails(): string[] {
  const raw = process.env.ADMIN_ALLOWED_EMAILS?.trim();
  if (!raw) return [...DEFAULT_ALLOWED_EMAILS];

  const parsed = raw
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);

  return parsed.length > 0 ? parsed : [...DEFAULT_ALLOWED_EMAILS];
}

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email?.trim()) return false;
  const normalized = normalizeEmail(email);
  return getAllowedAdminEmails().includes(normalized);
}

export function getAdminDisplayName(email: string): string {
  const normalized = normalizeEmail(email);
  return ADMIN_DISPLAY_NAMES[normalized] ?? normalized.split("@")[0] ?? normalized;
}
