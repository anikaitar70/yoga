export type EventJaLocale = {
  title?: string;
  description?: string;
  location?: string;
  externalLinkLabel?: string;
};

export function parseEventJaLocale(value: unknown): EventJaLocale | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  return {
    title: record.title ? String(record.title) : undefined,
    description: record.description ? String(record.description) : undefined,
    location: record.location ? String(record.location) : undefined,
    externalLinkLabel: record.externalLinkLabel ? String(record.externalLinkLabel) : undefined,
  };
}

export function eventJaLocaleHasContent(locale: EventJaLocale | null | undefined): boolean {
  if (!locale) return false;
  return Boolean(
    locale.title?.trim() ||
      locale.description?.trim() ||
      locale.location?.trim() ||
      locale.externalLinkLabel?.trim(),
  );
}

export function compactEventJaLocale(locale: EventJaLocale | null | undefined): EventJaLocale | undefined {
  if (!locale) return undefined;
  const next: EventJaLocale = {};
  if (locale.title?.trim()) next.title = locale.title.trim();
  if (locale.description?.trim()) next.description = locale.description.trim();
  if (locale.location?.trim()) next.location = locale.location.trim();
  if (locale.externalLinkLabel?.trim()) next.externalLinkLabel = locale.externalLinkLabel.trim();
  return Object.keys(next).length > 0 ? next : undefined;
}
