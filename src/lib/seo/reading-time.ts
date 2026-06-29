const WORDS_PER_MINUTE = 200;

export function blogSectionPlainText(sections: import("@/lib/blog-sections").BlogSection[]): string {
  return sections
    .map((section) => {
      switch (section.type) {
        case "TEXT":
        case "IMAGE_TEXT":
          return [section.title, ...section.paragraphs].filter(Boolean).join(" ");
        case "QUOTE":
          return [section.quote, section.attribution].filter(Boolean).join(" ");
        case "GALLERY":
          return [section.title, ...section.images.map((img) => img.title ?? img.alt)].filter(Boolean).join(" ");
        case "IMAGE":
          return [section.imageAlt, section.caption].filter(Boolean).join(" ");
        default:
          return "";
      }
    })
    .join(" ");
}

export function estimateReadingTimeMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function formatReadingTime(minutes: number, locale: "en" | "ja" = "en"): string {
  if (locale === "ja") {
    return `読了目安 ${minutes} 分`;
  }
  return `${minutes} min read`;
}
