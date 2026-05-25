import type {
  AboutPreviewContent,
  ContentBlock,
  HeroContent,
  MediaPage,
  PageIntro,
  PhilosophyContent,
  SiteConfig,
} from "@/content/types";
import { resolveContent } from "@/content/utils";
import { prisma } from "@/lib/prisma";

const fallbackSite: SiteConfig = {
  name: "Nirvana Yoga",
  tagline: "Movement, stillness, and creative living.",
  navigation: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Yoga", href: "/yoga" },
    { label: "Just Art Life", href: "/just-art-life" },
    { label: "Healing", href: "/healing" },
    { label: "Events", href: "/events" },
    { label: "Gallery", href: "/gallery" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "YouTube", href: "https://youtube.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
  ],
  contact: {
    email: "hello@nirvanayoga.studio",
    phone: "+1 (503) 555-0142",
    address: "218 Willow Lane, Portland, OR",
  },
};

const fallbackHero: HeroContent = {
  title: "Stillness is a practice.",
  subtitle:
    "Yoga, art, and everyday rituals—held with warmth and clarity at Nirvana Yoga.",
  primaryCta: { label: "View classes", href: "/yoga" },
  secondaryCta: { label: "Upcoming events", href: "/events" },
  imageSrc:
    "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=1600&q=80",
  imageAlt: "Serene studio interior with natural textures",
};

const fallbackAboutPreview: AboutPreviewContent = {
  heading: "A studio rooted in presence",
  body: "We teach yoga as a conversation between body and breath—not a performance. Our community blends mindful movement with creative living: ceramics at dusk, ink studies on Sundays, long walks before practice.",
  linkLabel: "Our story",
  linkHref: "/about",
  imageSrc:
    "https://images.unsplash.com/photo-1603988363607-e1e4c6697449?w=900&q=80",
  imageAlt: "Warm sunlight through linen curtains in a yoga space",
};

const fallbackPhilosophy: PhilosophyContent = {
  heading: "Philosophy",
  paragraphs: [
    "Practice doesn’t need to be loud to be honest. We honor slow transitions, intelligent sequencing, and room for questions.",
    "Art and lifestyle aren’t extras—they’re threads in the same cloth: attention, texture, and care made visible.",
  ],
};

const fallbackYogaOfferings: ContentBlock[] = [
  {
    id: "foundations",
    title: "Foundations & Slow Flow",
    body: "Breath-led transitions, joint-friendly options, and clear cues for newer students or anyone rebuilding capacity.",
  },
  {
    id: "vinyasa",
    title: "Steady Vinyasa",
    body: "Moderate pacing with intelligent sequencing—heat without hurry, strength with softness at the close.",
  },
  {
    id: "restorative",
    title: "Restorative & Yin",
    body: "Long-held shapes, props, and quiet language for nervous system ease—especially welcome after demanding weeks.",
  },
];

const fallbackHealingModalities: ContentBlock[] = [
  {
    id: "breath",
    title: "Breath & nervous system care",
    body: "Guided sessions that pair gentle movement with breath pacing—helpful for anxiety, fatigue, or reset between chapters.",
  },
  {
    id: "touch",
    title: "Restorative touch pathways",
    body: "Referrals to trusted bodyworkers who share our studio values; booking happens directly with practitioners.",
  },
  {
    id: "circles",
    title: "Community listening circles",
    body: "Facilitated evenings focused on grief, transition, and collective care—not therapy, but grounded presence.",
  },
];

const fallbackAboutPage: MediaPage = {
  eyebrow: "About",
  title: "Space for practice—not performance.",
  subtitle:
    "Nirvana Yoga began as a small circle seeking slower rhythms: breath-led classes, honest conversation, and room for beginners and longtime practitioners alike.",
  imageSrc:
    "https://images.unsplash.com/photo-1545389336-cf090694435e?w=1000&q=80",
  imageAlt: "Hands resting in meditation",
  paragraphs: [
    "Our teachers share lineage-informed sequencing without dogma. We teach alignment as inquiry—how your joints speak, how breath changes shape, when rest is the wisest edge.",
    "Alongside asana, we host gatherings that weave in ceramics, ink, poetry, and shared meals. Art here is not decoration; it is another language for showing up fully.",
    "Whether you arrive for sun salutations or Sunday sketching, you are invited to move at a humane pace—and to carry a little stillness back into your week.",
    "Our approach to healing is rooted in lived experience. The studio's founder began exploring healing early, returned to deeper study after a personal family health crisis, and over 15+ years trained across modalities. That path informs the way we support individual recovery: with steady presence, tailored guidance, and the understanding that healing is a long, inward practice rather than a quick fix.",
  ],
};

const fallbackJustArtLifePage: MediaPage = {
  eyebrow: "Lifestyle",
  title: "Just Art Life",
  subtitle:
    "A living column for creative practice—messy sketches, seasonal recipes, and studio vignettes.",
  imageSrc:
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200&q=80",
  imageAlt: "Paint brushes and paper on a wooden surface",
  paragraphs: [
    "“Just Art Life” is our shorthand for beauty without perfectionism: charcoal on Thursday nights, linen washed soft, playlists that hold silence between songs.",
    "Pop-ups pair gentle movement with open-studio hours—come early for breathwork, stay for clay or collage with guided prompts and zero pressure to share.",
    "Watch this space for seasonal essays and photo essays from our community; the blog carries longer reflections in the same spirit.",
  ],
};

const pageIntros: Record<string, PageIntro> = {
  yoga: {
    eyebrow: "Practice",
    title: "Yoga at Nirvana",
    subtitle:
      "Thoughtful classes that honor range of motion, fatigue, and curiosity.",
  },
  healing: {
    eyebrow: "Care",
    title: "Healing offerings",
    subtitle:
      "We hold scope with clarity: facilitators teach within their training; medical questions belong with clinicians.",
  },
  events: {
    eyebrow: "Calendar",
    title: "Events & immersions",
    subtitle:
      "Reserve early—guest teachers and seasonal retreats fill thoughtfully sized rooms.",
  },
  blog: {
    eyebrow: "Journal",
    title: "Blog",
    subtitle:
      "Longer reflections—movement, art, and the small rituals that hold a week together.",
  },
  gallery: {
    eyebrow: "Studio",
    title: "Gallery",
    subtitle: "Moments from our space—practice, objects, and the in-between.",
  },
  contact: {
    eyebrow: "Hello",
    title: "Contact",
    subtitle: "We read every note—studio replies within two business days.",
  },
};

export async function fetchSite(): Promise<SiteConfig> {
  const config = await prisma.siteConfig.findFirst();
  if (!config) {
    return resolveContent(fallbackSite);
  }

  return resolveContent({
    name: config.name,
    tagline: config.tagline,
    navigation: fallbackSite.navigation,
    social: config.social as { label: string; href: string }[],
    contact: {
      email: config.contactEmail,
      phone: config.contactPhone,
      address: config.contactAddress,
    },
  });
}

export async function fetchHero(): Promise<HeroContent> {
  const record = await prisma.heroSection.findFirst();
  if (!record) {
    return resolveContent(fallbackHero);
  }

  return resolveContent({
    title: record.title,
    subtitle: record.subtitle,
    primaryCta: {
      label: record.primaryCtaLabel,
      href: record.primaryCtaHref,
    },
    secondaryCta: {
      label: record.secondaryCtaLabel,
      href: record.secondaryCtaHref,
    },
    imageSrc: record.imageSrc,
    imageAlt: record.imageAlt,
  });
}

export async function fetchAboutPreview(): Promise<AboutPreviewContent> {
  return resolveContent({ ...fallbackAboutPreview });
}

export async function fetchPhilosophy(): Promise<PhilosophyContent> {
  return resolveContent({ ...fallbackPhilosophy });
}

export async function fetchYogaOfferings(): Promise<ContentBlock[]> {
  return resolveContent([...fallbackYogaOfferings]);
}

export async function fetchHealingModalities(): Promise<ContentBlock[]> {
  return resolveContent([...fallbackHealingModalities]);
}

export async function fetchAboutPage(): Promise<MediaPage> {
  const record = await prisma.aboutPage.findFirst();
  if (!record) {
    return resolveContent({ ...fallbackAboutPage });
  }

  return resolveContent({
    eyebrow: record.eyebrow,
    title: record.title,
    subtitle: record.subtitle,
    imageSrc: record.imageSrc,
    imageAlt: record.imageAlt,
    paragraphs: record.paragraphs,
  });
}

export async function fetchJustArtLifePage(): Promise<MediaPage> {
  return resolveContent({ ...fallbackJustArtLifePage });
}

export async function fetchPageIntro(
  key: keyof typeof pageIntros,
): Promise<PageIntro> {
  return resolveContent({ ...pageIntros[key] });
}

export { pageIntros };

