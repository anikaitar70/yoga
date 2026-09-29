import Link from "@/components/ui/Link";
import type { SiteConfig } from "@/content";
import { StudioContactLinks } from "@/components/content/StudioContactLinks";
import { SocialLinks } from "@/components/content/SocialLinks";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Container } from "@/components/ui/Container";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { RichText } from "@/components/content/RichText";
import { DEFAULT_CREDENTIALS_LOGO_PLACEMENT } from "@/lib/site-branding";
import { getLocale } from "@/lib/i18n/server";
import { loadSiteConfigRowForLocale } from "@/content/repositories/site-locale";
import { uiMessage } from "@/lib/i18n/resolve";

type FooterProps = {
  site: SiteConfig;
};

export async function Footer({ site }: FooterProps) {
  const locale = await getLocale();
  const localeContent = await loadSiteConfigRowForLocale();
  const { name, tagline, navigation: nav, social, contact } = site;

  const exploreLabel = uiMessage(locale, "explore", localeContent);
  const newsletterLabel = uiMessage(locale, "newsletterEyebrow", localeContent);
  const newsletterBlurb = uiMessage(locale, "newsletterBlurb", localeContent);
  const contactLabel = uiMessage(locale, "contactEyebrow", localeContent);
  const rightsReserved = locale === "ja" ? "無断転載を禁じます。" : "All rights reserved.";
  const crafted = locale === "ja" ? "穏やかな実践のために。" : "Crafted for calm practice.";

  const credentialsLogoSrc = site.branding.credentialsLogoSrc;
  // A background watermark with no meaningful alt text is decorative - hide it from screen readers.
  const credentialsLogoAlt = site.branding.credentialsLogoAlt ?? "";
  const credentialsLogoDecorative = credentialsLogoAlt.length === 0;
  const desktopPlacement = site.branding.credentialsLogoDesktop ?? DEFAULT_CREDENTIALS_LOGO_PLACEMENT.desktop;
  const mobilePlacement = site.branding.credentialsLogoMobile ?? DEFAULT_CREDENTIALS_LOGO_PLACEMENT.mobile;

  return (
    <footer className="mt-auto border-t border-border/60 bg-card/80">
      <div className="relative overflow-hidden">
        {credentialsLogoSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={credentialsLogoSrc}
              alt={credentialsLogoAlt}
              aria-hidden={credentialsLogoDecorative}
              loading="lazy"
              className="pointer-events-none absolute z-0 hidden h-auto object-contain select-none md:block"
              style={{
                left: `${desktopPlacement.xPercent}%`,
                top: `${desktopPlacement.yPercent}%`,
                width: `${desktopPlacement.widthPx}px`,
                transform: "translate(-50%, -50%)",
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={credentialsLogoSrc}
              alt={credentialsLogoAlt}
              aria-hidden={credentialsLogoDecorative}
              loading="lazy"
              className="pointer-events-none absolute z-0 h-auto object-contain select-none md:hidden"
              style={{
                left: `${mobilePlacement.xPercent}%`,
                top: `${mobilePlacement.yPercent}%`,
                width: `${mobilePlacement.widthPx}px`,
                transform: "translate(-50%, -50%)",
              }}
            />
          </>
        ) : null}

        <Container className="relative z-10 grid gap-14 py-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-12 lg:py-20">
          <div className="lg:col-span-1">
            <BrandLogo context="footer" className="max-w-[12rem]" />
            <p className="sr-only">{name}</p>
            <div className="mt-4 max-w-xs text-sm leading-[var(--leading-calm)] text-muted">
              <RichText html={tagline} />
            </div>
          </div>

          <div>
            <Eyebrow>{exploreLabel}</Eyebrow>
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
            <Eyebrow>{newsletterLabel}</Eyebrow>
            <p className="mt-5 text-sm leading-relaxed text-muted">{newsletterBlurb}</p>
            <NewsletterForm id="footer-newsletter" className="mt-5" dense />
          </div>

          <div>
            <Eyebrow>{contactLabel}</Eyebrow>
            <div className="mt-5">
              <StudioContactLinks contact={contact} />
            </div>
            <div className="mt-7">
              <SocialLinks links={social} layout="stack" />
            </div>
          </div>
        </Container>
      </div>

      <div className="border-t border-border/50 py-7">
        <Container className="flex flex-col items-start justify-between gap-3 text-xs text-muted sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {name}. {rightsReserved}
          </p>
          <p className="text-muted/70">{crafted}</p>
        </Container>
      </div>

      <div className="border-t border-border/40 bg-background/60 py-5">
        <Container>
          <p className="text-center text-[11px] tracking-[0.12em] text-muted/80 uppercase">
            <a
              href="https://anikait.page"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-primary-muted"
              suppressHydrationWarning
            >
              Designed &amp; Maintained by Anikait.page
            </a>
          </p>
        </Container>
      </div>
    </footer>
  );
}
