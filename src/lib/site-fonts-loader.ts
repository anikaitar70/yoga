import { Cormorant_Garamond, DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
});

/** Built-in fonts loaded via next/font (self-hosted). Other CMS font choices use Google Fonts CSS. */
export const BUILTIN_SITE_FONT_IDS = ["dm-sans", "cormorant-garamond"] as const;

export type BuiltinSiteFontId = (typeof BUILTIN_SITE_FONT_IDS)[number];

export const ALL_SITE_FONT_CLASS_NAMES = [dmSans.className, cormorantGaramond.className].join(" ");
