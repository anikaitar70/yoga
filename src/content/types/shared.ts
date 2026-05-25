export type NavItem = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export type SiteContact = {
  email: string;
  phone: string;
  address: string;
};

export type SiteConfig = {
  name: string;
  tagline: string;
  navigation: NavItem[];
  social: SocialLink[];
  contact: SiteContact;
};

export type CtaLink = {
  label: string;
  href: string;
};

export type HeroContent = {
  title: string;
  subtitle: string;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
  imageSrc: string;
  imageAlt: string;
};

export type AboutPreviewContent = {
  heading: string;
  body: string;
  linkLabel: string;
  linkHref: string;
  imageSrc: string;
  imageAlt: string;
};

export type PhilosophyContent = {
  heading: string;
  paragraphs: string[];
};

export type ContentBlock = {
  id: string;
  title: string;
  body: string;
};

export type PageIntro = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export type MediaPage = PageIntro & {
  imageSrc: string;
  imageAlt: string;
  paragraphs: string[];
};

export type MediaImageProps = {
  src: string;
  alt: string;
  aspectClass?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
};
