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
  tags: string[];
}
