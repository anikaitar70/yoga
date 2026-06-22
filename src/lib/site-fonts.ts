export const SITE_FONT_IDS = [
  "playfair-display",
  "cormorant-garamond",
  "eb-garamond",
  "lora",
  "merriweather",
  "libre-baskerville",
  "crimson-text",
  "source-serif-4",
  "dm-serif-display",
  "bodoni-moda",
  "inter",
  "poppins",
  "montserrat",
  "nunito-sans",
  "work-sans",
  "open-sans",
  "roboto",
  "manrope",
  "plus-jakarta-sans",
  "outfit",
  "dm-sans",
] as const;

export type SiteFontId = (typeof SITE_FONT_IDS)[number];

export type SiteFontChoice = {
  id: SiteFontId;
  label: string;
  category: "serif" | "sans";
  variable: string;
};

export const SITE_FONT_CHOICES: SiteFontChoice[] = [
  { id: "playfair-display", label: "Playfair Display", category: "serif", variable: "--font-playfair-display" },
  { id: "cormorant-garamond", label: "Cormorant Garamond", category: "serif", variable: "--font-cormorant" },
  { id: "eb-garamond", label: "EB Garamond", category: "serif", variable: "--font-eb-garamond" },
  { id: "lora", label: "Lora", category: "serif", variable: "--font-lora" },
  { id: "merriweather", label: "Merriweather", category: "serif", variable: "--font-merriweather" },
  { id: "libre-baskerville", label: "Libre Baskerville", category: "serif", variable: "--font-libre-baskerville" },
  { id: "crimson-text", label: "Crimson Text", category: "serif", variable: "--font-crimson-text" },
  { id: "source-serif-4", label: "Source Serif 4", category: "serif", variable: "--font-source-serif-4" },
  { id: "dm-serif-display", label: "DM Serif Display", category: "serif", variable: "--font-dm-serif-display" },
  { id: "bodoni-moda", label: "Bodoni Moda", category: "serif", variable: "--font-bodoni-moda" },
  { id: "inter", label: "Inter", category: "sans", variable: "--font-inter" },
  { id: "poppins", label: "Poppins", category: "sans", variable: "--font-poppins" },
  { id: "montserrat", label: "Montserrat", category: "sans", variable: "--font-montserrat" },
  { id: "nunito-sans", label: "Nunito Sans", category: "sans", variable: "--font-nunito-sans" },
  { id: "work-sans", label: "Work Sans", category: "sans", variable: "--font-work-sans" },
  { id: "open-sans", label: "Open Sans", category: "sans", variable: "--font-open-sans" },
  { id: "roboto", label: "Roboto", category: "sans", variable: "--font-roboto" },
  { id: "manrope", label: "Manrope", category: "sans", variable: "--font-manrope" },
  { id: "plus-jakarta-sans", label: "Plus Jakarta Sans", category: "sans", variable: "--font-plus-jakarta-sans" },
  { id: "outfit", label: "Outfit", category: "sans", variable: "--font-outfit" },
  { id: "dm-sans", label: "DM Sans", category: "sans", variable: "--font-dm-sans" },
];

const fontById = Object.fromEntries(SITE_FONT_CHOICES.map((entry) => [entry.id, entry])) as Record<
  SiteFontId,
  SiteFontChoice
>;

const BUILTIN_FONT_VARIABLES: Partial<Record<SiteFontId, string>> = {
  "dm-sans": "--font-dm-sans",
  "cormorant-garamond": "--font-cormorant",
};

export function isBuiltinSiteFont(fontId: SiteFontId): boolean {
  return fontId in BUILTIN_FONT_VARIABLES;
}

export function resolveFontCssVariable(fontId: SiteFontId): string {
  const variable = BUILTIN_FONT_VARIABLES[fontId];
  if (variable) {
    return `var(${variable})`;
  }
  const choice = fontById[fontId];
  return `'${choice?.label ?? "DM Sans"}', ${choice?.category === "serif" ? "serif" : "sans-serif"}`;
}

/** Google Fonts CSS URL for non-builtin families used in design settings. */
export function buildGoogleFontsHref(fontIds: SiteFontId[]): string | null {
  const families = new Set<string>();

  for (const fontId of fontIds) {
    if (isBuiltinSiteFont(fontId)) continue;
    const choice = fontById[fontId];
    if (!choice) continue;
    families.add(`${choice.label.replace(/ /g, "+")}:wght@300;400;500;600;700`);
  }

  if (families.size === 0) return null;

  return `https://fonts.googleapis.com/css2?${[...families].map((family) => `family=${family}`).join("&")}&display=swap`;
}
