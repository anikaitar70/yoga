export const UPLOAD_SECTIONS = [
  "events",
  "gallery",
  "testimonials",
  "blog",
  "homepage",
  "pages",
  "branding",
] as const;

export type UploadSection = (typeof UPLOAD_SECTIONS)[number];

export function isUploadSection(value: string): value is UploadSection {
  return (UPLOAD_SECTIONS as readonly string[]).includes(value);
}
