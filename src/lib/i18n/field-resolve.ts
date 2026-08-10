/** Returns true when a CMS Japanese string should be treated as manually provided. */
export function hasJaText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/** Manual JA → machine JA → English fallback for a single string field. */
export function resolveJaString(
  manual: string | null | undefined,
  machine: string | null | undefined,
  english: string,
): string {
  if (hasJaText(manual)) return manual!.trim();
  if (hasJaText(machine)) return machine!.trim();
  return english;
}

/** Strip empty strings from a shallow record before persisting locale patches. */
export function compactLocaleStrings<T extends Record<string, unknown>>(record: T): Partial<T> {
  const next: Partial<T> = {};
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "string") {
      if (value.trim()) next[key as keyof T] = value as T[keyof T];
      continue;
    }
    if (value !== undefined && value !== null) {
      next[key as keyof T] = value as T[keyof T];
    }
  }
  return next;
}

export type TranslationSource = "manual" | "machine" | "english";

export function translationSource(
  manual: string | null | undefined,
  machine: string | null | undefined,
): TranslationSource {
  if (hasJaText(manual)) return "manual";
  if (hasJaText(machine)) return "machine";
  return "english";
}
