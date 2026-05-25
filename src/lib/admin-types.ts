export type EventCategory = "yoga" | "healing" | "just-art-life" | "retreats-and-tours";

export interface AdminEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  category: EventCategory;
  isFeatured: boolean;
  published: boolean;
}

export interface AdminBlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl?: string | null;
  tags: string[];
  published: boolean;
  publishedAt: string;
}

export interface SiteSocialLink {
  label: string;
  href: string;
}

export interface AdminSiteConfig {
  id: string;
  name: string;
  tagline: string;
  navigation: { label: string; href: string }[];
  social: SiteSocialLink[];
  contact: {
    email: string;
    phone: string;
    address: string;
  };
}

export interface AdminHero {
  id: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  imageSrc: string;
  imageAlt: string;
}

export interface AdminAboutPage {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  paragraphs: string[];
}

export type TestimonialStatus = "pending" | "approved" | "rejected";

export interface AdminTestimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  status: TestimonialStatus;
}

export interface AdminGalleryItem {
  id: string;
  title?: string | null;
  src: string;
  alt: string;
  aspectClass?: string | null;
  description?: string | null;
  isPublished?: boolean;
}

export interface AdminSubscriber {
  id: string;
  email: string;
  name?: string | null;
  subscribedAt: string;
}

export interface AdminContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}
