import { pageIntroCopy } from "@/content/nirvana-copy";
import { aboutPageCopy } from "@/content/nirvana-copy";
import { heroCopy } from "@/content/nirvana-copy";
import type { Locale } from "@/lib/i18n/locale";
import { JA_DEFAULT_BUNDLE } from "@/lib/i18n/translations/ja";

export type StaticPageKey =
  | "home"
  | "about"
  | "yoga"
  | "healing"
  | "just-art-life"
  | "events"
  | "gallery"
  | "blog"
  | "contact";

export const STATIC_PAGE_PATHS: Record<StaticPageKey, string> = {
  home: "/",
  about: "/about",
  yoga: "/yoga",
  healing: "/healing",
  "just-art-life": "/just-art-life",
  events: "/events",
  gallery: "/gallery",
  blog: "/blog",
  contact: "/contact",
};

const EN_DEFAULTS: Record<StaticPageKey, { title: string; description: string }> = {
  home: {
    title: "Yoga, Art & Lifestyle",
    description: `${heroCopy.subtitle} ${heroCopy.body}`.slice(0, 160),
  },
  about: {
    title: aboutPageCopy.title,
    description: aboutPageCopy.subtitle,
  },
  yoga: {
    title: pageIntroCopy.yoga.title,
    description: pageIntroCopy.yoga.subtitle,
  },
  healing: {
    title: pageIntroCopy.healing.title,
    description: pageIntroCopy.healing.subtitle,
  },
  "just-art-life": {
    title: pageIntroCopy.justArtLife.title,
    description: pageIntroCopy.justArtLife.subtitle,
  },
  events: {
    title: pageIntroCopy.events.title,
    description: pageIntroCopy.events.subtitle,
  },
  gallery: {
    title: pageIntroCopy.gallery.title,
    description: pageIntroCopy.gallery.subtitle,
  },
  blog: {
    title: pageIntroCopy.blog.title,
    description: pageIntroCopy.blog.subtitle,
  },
  contact: {
    title: pageIntroCopy.contact.title,
    description: pageIntroCopy.contact.subtitle,
  },
};

const JA_PAGE_INTRO_KEYS: Partial<Record<StaticPageKey, string>> = {
  yoga: "yoga",
  healing: "healing",
  events: "events",
  gallery: "gallery",
  blog: "blog",
  contact: "contact",
  "just-art-life": "justArtLife",
};

export function getStaticPageDefaults(
  key: StaticPageKey,
  locale: Locale,
): { title: string; description: string; path: string } {
  const en = EN_DEFAULTS[key];
  const path = STATIC_PAGE_PATHS[key];

  if (locale === "ja") {
    if (key === "home") {
      return {
        path,
        title: "ヨガ、アート、ライフスタイル",
        description:
          "ヨガ、創造的な実践、意識的な暮らしのための穏やかなスタジオ。クラス、ワークショップ、コミュニティ。",
      };
    }
    if (key === "about") {
      const about = JA_DEFAULT_BUNDLE.aboutPage;
      return {
        path,
        title: about?.title ?? en.title,
        description: about?.subtitle ?? en.description,
      };
    }
    const introKey = JA_PAGE_INTRO_KEYS[key];
    if (introKey) {
      const patch = JA_DEFAULT_BUNDLE.pageIntros?.[introKey];
      return {
        path,
        title: patch?.title ?? en.title,
        description: patch?.subtitle ?? en.description,
      };
    }
  }

  return { path, title: en.title, description: en.description };
}

export const EVENT_CATEGORY_SEO: Record<
  string,
  { title: string; subtitle: string; description: string; path: string }
> = {
  yoga: {
    title: "Yoga Events",
    subtitle: "Classes, workshops, teacher training, and philosophy gatherings.",
    description: "Yoga classes, workshops, teacher training, and philosophy gatherings at Nirvana Yoga.",
    path: "/events/yoga",
  },
  "yoga-nidra": {
    title: "Yoga Nidra",
    subtitle: "Deep rest sessions and Yoga Nidra immersions.",
    description: "Deep rest sessions and Yoga Nidra immersions at Nirvana Yoga.",
    path: "/events/yoga-nidra",
  },
  workshop: {
    title: "Workshops",
    subtitle: "Focused immersions and special-topic workshops.",
    description: "Focused immersions and special-topic workshops at Nirvana Yoga.",
    path: "/events/workshop",
  },
  "teacher-training": {
    title: "Teacher Training",
    subtitle: "Professional development and certification programs.",
    description: "Professional development and certification programs at Nirvana Yoga.",
    path: "/events/teacher-training",
  },
  philosophy: {
    title: "Philosophy",
    subtitle: "Study circles and contemplative learning.",
    description: "Study circles and contemplative learning at Nirvana Yoga.",
    path: "/events/philosophy",
  },
  healing: {
    title: "Healing Sessions",
    subtitle: "Supportive modalities for your wellness journey.",
    description: "Supportive healing modalities for your wellness journey at Nirvana Yoga.",
    path: "/events/healing",
  },
  "just-art-life": {
    title: "Just Art Affaire Events",
    subtitle: "Creative rituals and lifestyle gatherings.",
    description: "Creative rituals and lifestyle gatherings at Nirvana Yoga.",
    path: "/events/just-art-life",
  },
  retreat: {
    title: "Retreats",
    subtitle: "Immersive retreats in nature and sacred destinations.",
    description: "Immersive yoga retreats in nature and sacred destinations.",
    path: "/events/retreat",
  },
  "retreats-and-tours": {
    title: "Retreats & Tours",
    subtitle: "Immersive experiences and travel programs.",
    description: "Immersive yoga retreats and travel programs offered by Nirvana Yoga.",
    path: "/events/retreats-and-tours",
  },
};

export const PUBLIC_STATIC_PATHS = Object.values(STATIC_PAGE_PATHS);

export const PUBLIC_EVENT_CATEGORY_PATHS = Object.values(EVENT_CATEGORY_SEO).map((c) => c.path);
