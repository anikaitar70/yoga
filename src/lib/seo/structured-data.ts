import type { SiteConfig } from "@/content/types";
import type { BlogPost } from "@/content/types";
import type { Event } from "@/content/types";
import { getMetadataBase } from "@/lib/site";
import { localizedPath } from "@/lib/i18n/paths";
import type { Locale } from "@/lib/i18n/locale";
import type { BreadcrumbItem } from "@/lib/seo/types";
import { estimateReadingTimeMinutes, blogSectionPlainText } from "@/lib/seo/reading-time";
import { BRAND_NAME } from "@/lib/brand";

type JsonLd = Record<string, unknown>;

function baseContext(): JsonLd {
  return { "@context": "https://schema.org" };
}

export function organizationJsonLd(site: SiteConfig): JsonLd {
  const base = getMetadataBase().toString().replace(/\/$/, "");
  return {
    ...baseContext(),
    "@type": ["Organization", "LocalBusiness", "YogaStudio"],
    "@id": `${base}/#organization`,
    name: site.name || BRAND_NAME,
    description: site.tagline,
    url: base,
    email: site.contact.email || undefined,
    telephone: site.contact.phone || undefined,
    address: site.contact.address
      ? {
          "@type": "PostalAddress",
          addressLocality: site.contact.address,
        }
      : undefined,
    sameAs: site.social?.map((link) => link.href).filter(Boolean),
    contactPoint: site.contact.email
      ? {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: site.contact.email,
          telephone: site.contact.phone || undefined,
          availableLanguage: ["English", "Japanese"],
        }
      : undefined,
  };
}

export function websiteJsonLd(site: SiteConfig, locale: Locale): JsonLd {
  const base = getMetadataBase().toString().replace(/\/$/, "");
  return {
    ...baseContext(),
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: site.name || BRAND_NAME,
    url: localizedPath("/", locale),
    publisher: { "@id": `${base}/#organization` },
    inLanguage: locale === "ja" ? "ja" : "en",
  };
}

export function webPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
  locale: Locale;
}): JsonLd {
  const base = getMetadataBase().toString().replace(/\/$/, "");
  const url = new URL(localizedPath(input.path, input.locale), base).toString();
  return {
    ...baseContext(),
    "@type": "WebPage",
    name: input.name,
    description: input.description,
    url,
    isPartOf: { "@id": `${base}/#website` },
    inLanguage: input.locale === "ja" ? "ja" : "en",
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[], locale: Locale): JsonLd {
  const base = getMetadataBase();
  return {
    ...baseContext(),
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: new URL(localizedPath(item.href, locale), base).toString(),
    })),
  };
}

export function blogPostingJsonLd(
  post: BlogPost & {
    updatedAt?: string;
    authorName?: string;
    readingTimeMinutes?: number;
  },
  locale: Locale,
): JsonLd {
  const base = getMetadataBase();
  const url = new URL(localizedPath(`/blog/${post.slug}`, locale), base).toString();
  const bodyText = [post.content, blogSectionPlainText(post.sections)].join(" ");
  const readingTime = post.readingTimeMinutes ?? estimateReadingTimeMinutes(bodyText);

  return {
    ...baseContext(),
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url,
    datePublished: post.date,
    dateModified: post.updatedAt ?? post.date,
    author: post.authorName
      ? { "@type": "Person", name: post.authorName }
      : { "@type": "Organization", name: BRAND_NAME },
    publisher: { "@id": `${base.toString().replace(/\/$/, "")}/#organization` },
    image: post.imageSrc
      ? {
          "@type": "ImageObject",
          url: new URL(post.imageSrc, base).toString(),
          caption: post.imageAlt,
        }
      : undefined,
    keywords: post.tags.join(", ") || undefined,
    articleSection: post.tags[0] || undefined,
    timeRequired: `PT${readingTime}M`,
    inLanguage: locale === "ja" ? "ja" : "en",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

export function blogListJsonLd(locale: Locale): JsonLd {
  const base = getMetadataBase().toString().replace(/\/$/, "");
  const url = new URL(localizedPath("/blog", locale), base).toString();
  return {
    ...baseContext(),
    "@type": "Blog",
    name: "Nirvana Yoga Journal",
    url,
    publisher: { "@id": `${base}/#organization` },
    inLanguage: locale === "ja" ? "ja" : "en",
  };
}

export function eventJsonLd(event: Event, locale: Locale): JsonLd {
  const base = getMetadataBase();
  const pageUrl = new URL(localizedPath(`/events/${event.category}`, locale), base).toString();

  return {
    ...baseContext(),
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.date,
    endDate: event.endDate ?? event.date,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: event.location,
      address: event.location,
    },
    image: event.imageUrl
      ? {
          "@type": "ImageObject",
          url: new URL(event.imageUrl, base).toString(),
        }
      : undefined,
    organizer: { "@id": `${base.toString().replace(/\/$/, "")}/#organization` },
    url: pageUrl,
    offers: event.price
      ? {
          "@type": "Offer",
          price: event.price,
          priceCurrency: "JPY",
          availability: "https://schema.org/InStock",
          url: new URL(localizedPath("/contact", locale), base).toString(),
        }
      : undefined,
  };
}

/** Strip undefined values for cleaner JSON-LD output. */
export function sanitizeJsonLd(data: JsonLd): JsonLd {
  const cleaned: JsonLd = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      const arr = value.map((item) =>
        typeof item === "object" && item !== null ? sanitizeJsonLd(item as JsonLd) : item,
      );
      if (arr.length > 0) cleaned[key] = arr;
    } else if (typeof value === "object") {
      cleaned[key] = sanitizeJsonLd(value as JsonLd);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export function jsonLdScript(data: JsonLd | JsonLd[]): string {
  const payload = Array.isArray(data) ? data.map(sanitizeJsonLd) : sanitizeJsonLd(data);
  return JSON.stringify(payload);
}
