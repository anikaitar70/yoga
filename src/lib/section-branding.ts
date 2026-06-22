export type SectionBranding = {
  sectionLogoSrc?: string;
  sectionLogoAlt?: string;
};

export function hasSectionLogo(branding: SectionBranding | null | undefined): boolean {
  return Boolean(branding?.sectionLogoSrc?.trim());
}

export function parseSectionBranding(value: unknown): SectionBranding {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const record = value as Record<string, unknown>;
  return {
    sectionLogoSrc:
      typeof record.sectionLogoSrc === "string" && record.sectionLogoSrc.trim()
        ? record.sectionLogoSrc.trim()
        : undefined,
    sectionLogoAlt:
      typeof record.sectionLogoAlt === "string" ? record.sectionLogoAlt : undefined,
  };
}
