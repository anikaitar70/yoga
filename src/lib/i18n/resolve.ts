import type {
  AboutPreviewContent,
  HeroContent,
  MediaPage,
  PageIntro,
  PhilosophyContent,
  SiteConfig,
} from "@/content/types";
import type { HomepageSectionsContent } from "@/lib/homepage-sections";
import {
  mergeLocaleBundle,
  parseLocaleContent,
  type LocaleBundle,
  type LocaleContentStore,
  type LocaleHomepageSectionsPatch,
  type LocalePageSectionPatch,
} from "@/lib/i18n/locale-content";
import { localizeHref } from "@/lib/i18n/paths";
import type { Locale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";
import { JA_DEFAULT_BUNDLE } from "@/lib/i18n/translations/ja";
import { JA_PAGE_SECTIONS } from "@/lib/i18n/translations/ja-page-sections";
import { JA_BLOG_BY_SLUG } from "@/lib/i18n/translations/ja-blog";
import { lookupJaEventPatch } from "@/lib/i18n/translations/ja-events";
import { lookupJaTestimonialPatch } from "@/lib/i18n/translations/ja-testimonials";
import type { BlogPost, Event, Testimonial } from "@/content/types";
import type { PageSectionRecord, PageType } from "@/lib/page-section-types";
import { JA_UI, type UiMessageKey } from "@/lib/i18n/ui";

let cachedJaBundle: LocaleBundle | undefined;

export function getJapaneseBundle(cmsLocaleContent: unknown): LocaleBundle {
  const cms = parseLocaleContent(cmsLocaleContent)?.ja;
  return mergeLocaleBundle(JA_DEFAULT_BUNDLE, cms) ?? JA_DEFAULT_BUNDLE;
}

export function resolveLocaleBundle(locale: Locale, cmsLocaleContent: unknown): LocaleBundle | null {
  if (locale === DEFAULT_LOCALE) return null;
  if (cachedJaBundle && !cmsLocaleContent) return cachedJaBundle;
  const bundle = getJapaneseBundle(cmsLocaleContent);
  if (!cmsLocaleContent) cachedJaBundle = bundle;
  return bundle;
}

export function localizeSiteConfig(site: SiteConfig, locale: Locale, cmsLocaleContent: unknown): SiteConfig {
  if (locale === DEFAULT_LOCALE) return site;
  const bundle = resolveLocaleBundle(locale, cmsLocaleContent);
  if (!bundle?.site) return site;

  const navigation = (bundle.site.navigation ?? site.navigation).map((item) => ({
    ...item,
    href: localizeHref(item.href, locale),
  }));

  return {
    ...site,
    name: bundle.site.name ?? site.name,
    tagline: bundle.site.tagline ?? site.tagline,
    navigation,
  };
}

export function localizeHero(hero: HeroContent, locale: Locale, cmsLocaleContent: unknown): HeroContent {
  if (locale === DEFAULT_LOCALE) return hero;
  const bundle = resolveLocaleBundle(locale, cmsLocaleContent);
  const patch = bundle?.hero;
  if (!patch) return hero;

  return {
    ...hero,
    title: patch.title ?? hero.title,
    subtitle: patch.subtitle ?? hero.subtitle,
    imageAlt: patch.imageAlt ?? hero.imageAlt,
    primaryCta: {
      ...hero.primaryCta,
      label: patch.primaryCtaLabel ?? hero.primaryCta.label,
      href: localizeHref(hero.primaryCta.href, locale),
    },
    secondaryCta: {
      ...hero.secondaryCta,
      label: patch.secondaryCtaLabel ?? hero.secondaryCta.label,
      href: localizeHref(hero.secondaryCta.href, locale),
    },
  };
}

function mergeHomepagePatch(
  sections: HomepageSectionsContent,
  patch: LocaleHomepageSectionsPatch | undefined,
  locale: Locale,
): HomepageSectionsContent {
  if (!patch) return sections;

  const next = {
    ...sections,
    ...patch,
    aboutPreview: {
      ...sections.aboutPreview,
      ...patch.aboutPreview,
      highlights: (patch.aboutPreview?.highlights ?? sections.aboutPreview.highlights) as string[],
      linkHref: localizeHref(patch.aboutPreview?.linkHref ?? sections.aboutPreview.linkHref, locale),
    },
    philosophy: {
      ...sections.philosophy,
      ...patch.philosophy,
      sutras: (patch.philosophy?.sutras ?? sections.philosophy.sutras) as PhilosophyContent["sutras"],
      paragraphs: (patch.philosophy?.paragraphs ?? sections.philosophy.paragraphs) as string[],
    },
    newsletter: { ...sections.newsletter, ...patch.newsletter },
    pathways: (patch.pathways ?? sections.pathways).map((pathway, index) => {
      const base = sections.pathways[index] ?? pathway!;
      const merged = { ...base, ...pathway };
      return {
        ...merged,
        highlights: (merged.highlights ?? base.highlights) as string[],
        href: localizeHref(merged.href ?? base.href, locale),
      };
    }),
    featuredEvents: {
      ...sections.featuredEvents,
      ...patch.featuredEvents,
      ctaHref: patch.featuredEvents?.ctaHref
        ? localizeHref(patch.featuredEvents.ctaHref, locale)
        : sections.featuredEvents.ctaHref
          ? localizeHref(sections.featuredEvents.ctaHref, locale)
          : undefined,
    },
    retreats: {
      ...sections.retreats,
      ...patch.retreats,
      primaryCta: patch.retreats?.primaryCta?.label
        ? {
            label: patch.retreats.primaryCta.label,
            href: localizeHref(patch.retreats.primaryCta.href ?? sections.retreats.primaryCta?.href ?? "#", locale),
          }
        : sections.retreats.primaryCta
          ? { ...sections.retreats.primaryCta, href: localizeHref(sections.retreats.primaryCta.href, locale) }
          : undefined,
    },
    gallery: {
      ...sections.gallery,
      ...patch.gallery,
      primaryCta: patch.gallery?.primaryCta?.label
        ? {
            label: patch.gallery.primaryCta.label,
            href: localizeHref(patch.gallery.primaryCta.href ?? sections.gallery.primaryCta?.href ?? "/gallery", locale),
          }
        : sections.gallery.primaryCta
          ? { ...sections.gallery.primaryCta, href: localizeHref(sections.gallery.primaryCta.href, locale) }
          : undefined,
    },
    testimonials: { ...sections.testimonials, ...patch.testimonials },
    contactPreview: {
      ...sections.contactPreview,
      ...patch.contactPreview,
      primaryCta: patch.contactPreview?.primaryCta?.label
        ? {
            label: patch.contactPreview.primaryCta.label,
            href: localizeHref(
              patch.contactPreview.primaryCta.href ?? sections.contactPreview.primaryCta?.href ?? "/contact",
              locale,
            ),
          }
        : sections.contactPreview.primaryCta
          ? {
              ...sections.contactPreview.primaryCta,
              href: localizeHref(sections.contactPreview.primaryCta.href, locale),
            }
          : undefined,
      secondaryCta: patch.contactPreview?.secondaryCta?.label
        ? {
            label: patch.contactPreview.secondaryCta.label,
            href: localizeHref(
              patch.contactPreview.secondaryCta.href ?? sections.contactPreview.secondaryCta?.href ?? "/events",
              locale,
            ),
          }
        : sections.contactPreview.secondaryCta
          ? {
              ...sections.contactPreview.secondaryCta,
              href: localizeHref(sections.contactPreview.secondaryCta.href, locale),
            }
          : undefined,
    },
    schedule: { ...sections.schedule, ...patch.schedule },
    weeklySessions: sections.weeklySessions,
    upcomingPrograms: sections.upcomingPrograms.map((program) => ({
      ...program,
      href: localizeHref(program.href, locale),
    })),
  } as HomepageSectionsContent;

  return next;
}

export function localizeHomepageSections(
  sections: HomepageSectionsContent,
  locale: Locale,
  cmsLocaleContent: unknown,
): HomepageSectionsContent {
  if (locale === DEFAULT_LOCALE) return sections;
  const bundle = resolveLocaleBundle(locale, cmsLocaleContent);
  return mergeHomepagePatch(sections, bundle?.homepageSections, locale);
}

export function localizeAboutPage(page: MediaPage, locale: Locale, cmsLocaleContent: unknown): MediaPage {
  if (locale === DEFAULT_LOCALE) return page;
  const bundle = resolveLocaleBundle(locale, cmsLocaleContent);
  const patch = bundle?.aboutPage;
  if (!patch) return page;

  return {
    ...page,
    eyebrow: patch.eyebrow ?? page.eyebrow,
    title: patch.title ?? page.title,
    subtitle: patch.subtitle ?? page.subtitle,
    imageAlt: patch.imageAlt ?? page.imageAlt,
    paragraphs: patch.paragraphs ?? page.paragraphs,
  };
}

export function localizePageIntro(
  intro: PageIntro,
  key: string,
  locale: Locale,
  cmsLocaleContent: unknown,
): PageIntro {
  if (locale === DEFAULT_LOCALE) return intro;
  const bundle = resolveLocaleBundle(locale, cmsLocaleContent);
  const patch = bundle?.pageIntros?.[key];
  if (!patch) return intro;

  return {
    ...intro,
    eyebrow: patch.eyebrow ?? intro.eyebrow,
    title: patch.title ?? intro.title,
    subtitle: patch.subtitle ?? intro.subtitle,
  };
}

function mergePageSectionPayload(
  base: PageSectionRecord["payload"] | null | undefined,
  patch: LocalePageSectionPatch["payload"] | undefined,
): PageSectionRecord["payload"] {
  if (!patch) return base ?? null;
  if (!base || typeof base !== "object") return patch as PageSectionRecord["payload"];
  if (typeof patch !== "object") return patch as PageSectionRecord["payload"];

  const merged = { ...base, ...patch } as Record<string, unknown>;
  const baseRecord = base as Record<string, unknown>;
  const patchRecord = patch as Record<string, unknown>;

  if (Array.isArray(patchRecord.paragraphs)) {
    merged.paragraphs = patchRecord.paragraphs;
  }
  if (Array.isArray(patchRecord.highlights)) {
    merged.highlights = patchRecord.highlights;
  }
  if (Array.isArray(patchRecord.sutras)) {
    merged.sutras = patchRecord.sutras;
  }
  if (patchRecord.sutra && typeof patchRecord.sutra === "object") {
    merged.sutra = {
      ...(typeof baseRecord.sutra === "object" && baseRecord.sutra ? baseRecord.sutra : {}),
      ...patchRecord.sutra,
    };
  }
  if (patchRecord.timeline && typeof patchRecord.timeline === "object") {
    const baseTimeline =
      typeof baseRecord.timeline === "object" && baseRecord.timeline ? baseRecord.timeline : {};
    const patchTimeline = patchRecord.timeline as Record<string, unknown>;
    merged.timeline = {
      ...baseTimeline,
      ...patchTimeline,
      items: Array.isArray(patchTimeline.items)
        ? patchTimeline.items
        : (baseTimeline as { items?: unknown }).items,
    };
  }

  return merged as PageSectionRecord["payload"];
}

function getPayloadVariant(payload: PageSectionRecord["payload"]): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const variant = (payload as { variant?: unknown }).variant;
  return typeof variant === "string" ? variant : undefined;
}

function resolvePageSectionPatch(
  section: PageSectionRecord,
  index: number,
  cmsOverrides?: LocalePageSectionPatch[],
  staticOverrides?: LocalePageSectionPatch[],
): LocalePageSectionPatch | undefined {
  if (cmsOverrides?.[index]) return cmsOverrides[index];

  const variant = getPayloadVariant(section.payload);
  if (variant && staticOverrides) {
    const byVariant = staticOverrides.find((patch) => {
      const payload = patch.payload as { variant?: string } | undefined;
      return payload?.variant === variant;
    });
    if (byVariant) return byVariant;
  }

  return staticOverrides?.[index];
}

export function localizePageSections(
  sections: PageSectionRecord[],
  pageType: PageType,
  locale: Locale,
  cmsLocaleContent: unknown,
): PageSectionRecord[] {
  if (locale === DEFAULT_LOCALE) return sections;

  const bundle = resolveLocaleBundle(locale, cmsLocaleContent);
  const cmsOverrides = bundle?.pageSections?.[pageType];
  const staticOverrides = JA_PAGE_SECTIONS[pageType];

  return sections.map((section, index) => {
    const patch = resolvePageSectionPatch(section, index, cmsOverrides, staticOverrides);
    if (!patch) return section;

    return {
      ...section,
      title: patch.title ?? section.title,
      subtitle: patch.subtitle ?? section.subtitle,
      content: patch.content ?? section.content,
      imageAlt: patch.imageAlt ?? section.imageAlt,
      payload: mergePageSectionPayload(section.payload, patch.payload),
    };
  });
}

export function localizeEvent(event: Event, locale: Locale): Event {
  if (locale === DEFAULT_LOCALE) return event;
  const patch = lookupJaEventPatch(event);
  if (!patch) return event;
  return {
    ...event,
    title: patch.title ?? event.title,
    description: patch.description ?? event.description,
    location: patch.location ?? event.location,
  };
}

export function localizeEvents(events: Event[], locale: Locale): Event[] {
  if (locale === DEFAULT_LOCALE) return events;
  return events.map((event) => localizeEvent(event, locale));
}

export function localizeTestimonial(testimonial: Testimonial, locale: Locale): Testimonial {
  if (locale === DEFAULT_LOCALE) return testimonial;
  const patch = lookupJaTestimonialPatch(testimonial);
  if (!patch) return testimonial;
  return {
    ...testimonial,
    quote: patch.quote ?? testimonial.quote,
    role: patch.role ?? testimonial.role,
    city: patch.city ?? testimonial.city,
    country: patch.country ?? testimonial.country,
  };
}

export function localizeTestimonials(testimonials: Testimonial[], locale: Locale): Testimonial[] {
  if (locale === DEFAULT_LOCALE) return testimonials;
  return testimonials.map((testimonial) => localizeTestimonial(testimonial, locale));
}

export function localizeBlogPost(post: BlogPost, locale: Locale): BlogPost {
  if (locale === DEFAULT_LOCALE) return post;
  const patch = JA_BLOG_BY_SLUG[post.slug];
  if (!patch) return post;
  return {
    ...post,
    title: patch.title ?? post.title,
    excerpt: patch.excerpt ?? post.excerpt,
    content: patch.content ?? post.content,
    imageAlt: patch.title ?? post.imageAlt,
  };
}

export function uiMessage(
  locale: Locale,
  key: UiMessageKey,
  cmsLocaleContent?: unknown,
): string {
  if (locale === DEFAULT_LOCALE) {
    const EN_UI: Record<UiMessageKey, string> = {
      explore: "Explore",
      newsletterEyebrow: "Newsletter",
      newsletterBlurb: "Seasonal updates and retreat announcements.",
      newsletterTitle: "Notes from the studio",
      newsletterSubtitle: "Monthly letters—classes, workshops, and quiet invitations.",
      newsletterPlaceholder: "Email address",
      newsletterSubmit: "Subscribe",
      contactEyebrow: "Contact",
      viewAllEvents: "View all events",
      viewAllGallery: "View full gallery",
      readFullStory: "Read Shalini's full story",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      languageLabel: "Language",
      viewFullCalendar: "View full calendar →",
      featured: "Featured",
      reserveSpot: "Reserve a spot",
      inquireRetreat: "Inquire about this retreat",
      noUpcomingEvents: "No upcoming events",
      noUpcomingEventsDesc: "Check back soon for workshops, immersions, and studio gatherings.",
      contactStudio: "Contact the studio",
      visitContactPage: "Visit contact page",
      eventsAriaLabel: "Events",
      events: "Events",
      formName: "Name",
      formEmail: "Email",
      formPhone: "Phone number",
      formContactMethod: "Preferred contact method",
      formMessage: "Message",
      formSubmit: "Send message",
      formSuccess: "Thank you — we received your message and will reply soon.",
      formError: "Unable to send message. Please try again.",
      readMore: "Read more",
      backToBlog: "Back to blog",
      breadcrumbNav: "Breadcrumb",
      home: "Home",
      blog: "Blog",
      translationDisclaimer:
        "Some content on this page has been translated automatically. While we strive for accuracy, there may be translation errors. If anything is unclear, please refer to the English version or contact us.",
      translationDisclaimerDismiss: "Dismiss",
      relatedArticles: "Related articles",
      readingTime: "Reading time",
      minRead: "min read",
    };
    return EN_UI[key];
  }

  const bundle = resolveLocaleBundle(locale, cmsLocaleContent);
  return bundle?.ui?.[key] ?? JA_UI[key];
}

export type { LocaleContentStore, LocaleBundle };
