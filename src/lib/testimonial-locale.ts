export type TestimonialJaLocale = {
  quote?: string;
  name?: string;
  role?: string;
  city?: string;
  country?: string;
};

export function parseTestimonialJaLocale(value: unknown): TestimonialJaLocale | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  return {
    quote: record.quote ? String(record.quote) : undefined,
    name: record.name ? String(record.name) : undefined,
    role: record.role ? String(record.role) : undefined,
    city: record.city ? String(record.city) : undefined,
    country: record.country ? String(record.country) : undefined,
  };
}

export function testimonialJaLocaleHasContent(locale: TestimonialJaLocale | null | undefined): boolean {
  if (!locale) return false;
  return Boolean(
    locale.quote?.trim() ||
      locale.name?.trim() ||
      locale.role?.trim() ||
      locale.city?.trim() ||
      locale.country?.trim(),
  );
}

export function compactTestimonialJaLocale(
  locale: TestimonialJaLocale | null | undefined,
): TestimonialJaLocale | undefined {
  if (!locale) return undefined;
  const next: TestimonialJaLocale = {};
  if (locale.quote?.trim()) next.quote = locale.quote.trim();
  if (locale.name?.trim()) next.name = locale.name.trim();
  if (locale.role?.trim()) next.role = locale.role.trim();
  if (locale.city?.trim()) next.city = locale.city.trim();
  if (locale.country?.trim()) next.country = locale.country.trim();
  return Object.keys(next).length > 0 ? next : undefined;
}
