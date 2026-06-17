import Link from "next/link";
import type { SiteConfig } from "@/content";
import { StudioContactLinks } from "@/components/content/StudioContactLinks";
import { SocialLinks } from "@/components/content/SocialLinks";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/layout/NewsletterForm";

type FooterProps = {
  site: SiteConfig;
};

export function Footer({ site }: FooterProps) {
  const { name, tagline, navigation: nav, social, contact } = site;

  return (
    <footer className="mt-auto border-t border-border/60 bg-card/80">
      <Container className="grid gap-14 py-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-12 lg:py-20">
        <div className="lg:col-span-1">
          <BrandLogo context="footer" className="max-w-[12rem]" />
          <p className="sr-only">{name}</p>
          <p className="mt-4 max-w-xs text-sm leading-[var(--leading-calm)] text-muted">
            {tagline}
          </p>
        </div>

        <div>
          <Eyebrow>Explore</Eyebrow>
          <ul className="mt-5 space-y-2.5 text-sm">
            {nav.slice(0, 6).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted transition-colors duration-300 hover:text-primary-muted"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Eyebrow>Newsletter</Eyebrow>
          <p className="mt-5 text-sm leading-relaxed text-muted">
            Seasonal updates and retreat announcements.
          </p>
          <NewsletterForm id="footer-newsletter" className="mt-5" dense />
        </div>

        <div>
          <Eyebrow>Contact</Eyebrow>
          <div className="mt-5">
            <StudioContactLinks contact={contact} />
          </div>
          <div className="mt-7">
            <SocialLinks links={social} layout="stack" />
          </div>
        </div>
      </Container>

      <div className="border-t border-border/50 py-7">
        <Container className="flex flex-col items-start justify-between gap-3 text-xs text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
          <p className="text-muted/70">Crafted for calm practice.</p>
        </Container>
      </div>
    </footer>
  );
}
