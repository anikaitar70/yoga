import type { BlogSection } from "@/lib/blog-sections";

export type BlogJaLocale = {
  title?: string;
  summary?: string;
  content?: string;
  sections?: BlogSection[];
};

export function parseBlogJaLocale(value: unknown): BlogJaLocale | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  return {
    title: record.title ? String(record.title) : undefined,
    summary: record.summary ? String(record.summary) : undefined,
    content: record.content ? String(record.content) : undefined,
    sections: Array.isArray(record.sections) ? (record.sections as BlogSection[]) : undefined,
  };
}

export function blogJaLocaleHasContent(locale: BlogJaLocale | null | undefined): boolean {
  if (!locale) return false;
  if (locale.title?.trim()) return true;
  if (locale.summary?.trim()) return true;
  if (locale.content?.trim()) return true;
  if (locale.sections?.length) return true;
  return false;
}
