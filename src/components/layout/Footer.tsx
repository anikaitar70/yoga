import Link from "next/link";
import type { SiteConfig } from "@/content";
import { formatPhoneHref } from "@/lib/format";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/layout/NewsletterForm";

type FooterProps = {
  site: SiteConfig;
};

export function Footer({ site }: FooterProps) {
  const { name, tagline, navigation: nav, social, contact } = site;

  return (
    <footer className="mt-auto border-t border-border bg-card/60">
      <Container className="grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        <div className="lg:col-span-1">
          <p className="font-display text-xl font-medium text-foreground">
            {name}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            {tagline}
          </p>
        </div>

        <div>
          <Eyebrow>Explore</Eyebrow>
          <ul className="mt-4 space-y-2 text-sm">
            {nav.slice(0, 6).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Eyebrow>Newsletter</Eyebrow>
          <p className="mt-4 text-sm text-muted">
            Seasonal updates and retreat announcements.
          </p>
          <NewsletterForm id="footer-newsletter" className="mt-4" dense />
        </div>

        <div>
          <Eyebrow>Contact</Eyebrow>
          <address className="mt-4 space-y-2 text-sm not-italic leading-relaxed text-muted">
            <p>
              <a
                href={`mailto:${contact.email}`}
                className="hover:text-foreground"
              >
                {contact.email}
              </a>
            </p>
            <p>
              <a href={formatPhoneHref(contact.phone)} className="hover:text-foreground">
                {contact.phone}
              </a>
            </p>
            <p>{contact.address}</p>
          </address>
          <div className="mt-6 flex flex-wrap gap-4">
            {social.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                {link.label}
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            ))}
          </div>
        </div>
      </Container>

      <div className="border-t border-border py-6">
        <Container className="flex flex-col items-start justify-between gap-3 text-xs text-muted sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <p className="text-muted/80">Crafted for calm practice.</p>
        </Container>
      </div>
    </footer>
  );
}
