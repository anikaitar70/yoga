import { z } from "zod";

const dateTimeString = z
  .string()
  .datetime({ offset: true })
  .or(z.string().regex(/^[0-9TZ:.+-]+$/, "Invalid ISO date string"));

const localImageUrl = z.string().regex(/^\/uploads\/.*$/, "Invalid image URL");

const eventCategory = z.enum(["YOGA", "HEALING", "JUST_ART_LIFE", "RETREATS_AND_TOURS"]).default("YOGA");

const testimonialStatus = z.enum(["PENDING", "APPROVED", "REJECTED"]).default("APPROVED");

export const eventCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  startsAt: dateTimeString,
  endsAt: dateTimeString.optional(),
  imageUrl: z.string().url().or(localImageUrl).optional(),
  price: z.number().nonnegative().optional(),
  category: eventCategory.optional(),
  isFeatured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export const eventUpdateSchema = eventCreateSchema.partial();

export const testimonialCreateSchema = z.object({
  quote: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  status: testimonialStatus.optional(),
});

export const testimonialUpdateSchema = testimonialCreateSchema.partial();


export const blogCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().min(1),
  content: z.string().min(1),
  coverImageUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  publishedAt: dateTimeString.optional(),
});

export const blogUpdateSchema = blogCreateSchema.partial();

export const userCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional(),
});

export const newsletterCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
});

export const contactCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
});

export const galleryCreateSchema = z.object({
  title: z.string().min(1).optional(),
  url: z.string().url(),
  altText: z.string().min(1).optional(),
  description: z.string().optional(),
  aspectClass: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const heroUpdateSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  primaryCtaLabel: z.string().min(1),
  primaryCtaHref: z.string().min(1),
  secondaryCtaLabel: z.string().min(1),
  secondaryCtaHref: z.string().min(1),
  imageSrc: z.string().min(1),
  imageAlt: z.string().min(1),
});

export const aboutUpdateSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  imageSrc: z.string().min(1),
  imageAlt: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
});

export const siteUpdateSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
  contactAddress: z.string().min(1),
  social: z
    .array(
      z.object({
        label: z.string().min(1),
        href: z.string().min(1),
      }),
    )
    .optional(),
});

export function formatZodErrors(error: z.ZodError) {
  return error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join(".") : "body";
    return `${path}: ${issue.message}`;
  });
}
