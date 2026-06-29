export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  sections: import("@/lib/blog-sections").BlogSection[];
  imageSrc: string;
  imageAlt: string;
  date: string;
  updatedAt?: string;
  tags: string[];
  authorName?: string;
  seoTitle?: string | null;
  metaDescription?: string | null;
  ogImageUrl?: string | null;
  canonicalUrlOverride?: string | null;
  focusKeywords?: string[];
  jaTranslationStatus?: "MACHINE" | "HUMAN_REVIEWED";
}
