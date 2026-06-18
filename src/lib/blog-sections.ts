import { z } from "zod";
import { LOCAL_UPLOAD_PATH_REGEX } from "@/lib/upload-url";

const imageUrlField = z.union([
  z.string().url(),
  z.string().regex(LOCAL_UPLOAD_PATH_REGEX, "Invalid image URL"),
]);

export const BLOG_SECTION_TYPES = ["TEXT", "IMAGE", "IMAGE_TEXT", "GALLERY", "QUOTE"] as const;
export type BlogSectionType = (typeof BLOG_SECTION_TYPES)[number];

export type BlogTextSection = {
  id: string;
  type: "TEXT";
  title?: string;
  paragraphs: string[];
};

export type BlogImageSection = {
  id: string;
  type: "IMAGE";
  imageUrl: string;
  imageAlt: string;
  caption?: string;
};

export type BlogImageTextSection = {
  id: string;
  type: "IMAGE_TEXT";
  title?: string;
  imageUrl: string;
  imageAlt: string;
  paragraphs: string[];
  imageSide?: "left" | "right";
};

export type BlogGallerySection = {
  id: string;
  type: "GALLERY";
  title?: string;
  images: Array<{ url: string; alt: string; title?: string }>;
};

export type BlogQuoteSection = {
  id: string;
  type: "QUOTE";
  quote: string;
  attribution?: string;
};

export type BlogSection =
  | BlogTextSection
  | BlogImageSection
  | BlogImageTextSection
  | BlogGallerySection
  | BlogQuoteSection;

const blogTextSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("TEXT"),
  title: z.string().optional(),
  paragraphs: z.array(z.string()).default([]),
});

const blogImageSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("IMAGE"),
  imageUrl: imageUrlField,
  imageAlt: z.string().min(1),
  caption: z.string().optional(),
});

const blogImageTextSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("IMAGE_TEXT"),
  title: z.string().optional(),
  imageUrl: imageUrlField,
  imageAlt: z.string().min(1),
  paragraphs: z.array(z.string()).default([]),
  imageSide: z.enum(["left", "right"]).optional(),
});

const blogGallerySectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("GALLERY"),
  title: z.string().optional(),
  images: z
    .array(
      z.object({
        url: imageUrlField,
        alt: z.string().min(1),
        title: z.string().optional(),
      }),
    )
    .default([]),
});

const blogQuoteSectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal("QUOTE"),
  quote: z.string().min(1),
  attribution: z.string().optional(),
});

export const blogSectionSchema = z.discriminatedUnion("type", [
  blogTextSectionSchema,
  blogImageSectionSchema,
  blogImageTextSectionSchema,
  blogGallerySectionSchema,
  blogQuoteSectionSchema,
]);

export const blogSectionsSchema = z.array(blogSectionSchema);

export function parseBlogSections(value: unknown): BlogSection[] {
  if (!Array.isArray(value)) return [];
  const parsed = blogSectionsSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function createEmptyBlogSection(type: BlogSectionType): BlogSection {
  const id = crypto.randomUUID();
  switch (type) {
    case "TEXT":
      return { id, type: "TEXT", paragraphs: [""] };
    case "IMAGE":
      return { id, type: "IMAGE", imageUrl: "", imageAlt: "" };
    case "IMAGE_TEXT":
      return { id, type: "IMAGE_TEXT", imageUrl: "", imageAlt: "", paragraphs: [""], imageSide: "left" };
    case "GALLERY":
      return { id, type: "GALLERY", images: [] };
    case "QUOTE":
      return { id, type: "QUOTE", quote: "" };
  }
}

export function sanitizeBlogSectionsForSave(sections: BlogSection[]): BlogSection[] {
  return sections
    .map((section) => {
      switch (section.type) {
        case "TEXT": {
          const paragraphs = section.paragraphs.map((p) => p.trim()).filter(Boolean);
          if (paragraphs.length === 0) return null;
          return { ...section, paragraphs };
        }
        case "IMAGE":
          if (!section.imageUrl.trim() || !section.imageAlt.trim()) return null;
          return section;
        case "IMAGE_TEXT": {
          const paragraphs = section.paragraphs.map((p) => p.trim()).filter(Boolean);
          if (!section.imageUrl.trim() || !section.imageAlt.trim() || paragraphs.length === 0) return null;
          return { ...section, paragraphs };
        }
        case "GALLERY": {
          const images = section.images.filter((image) => image.url.trim() && image.alt.trim());
          if (images.length === 0) return null;
          return { ...section, images };
        }
        case "QUOTE":
          if (!section.quote.trim()) return null;
          return section;
        default:
          return null;
      }
    })
    .filter((section): section is BlogSection => section !== null);
}

export function blogHasRenderableBody(content: string, sections: BlogSection[]): boolean {
  if (sections.length > 0) return true;
  return content.trim().length > 0;
}
