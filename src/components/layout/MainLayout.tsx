import type { SiteConfig } from "@/content";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SiteScrollBackground } from "@/components/layout/SiteScrollBackground";
import { TranslationDisclaimer } from "@/components/i18n/TranslationDisclaimer";
import { resolveSiteBackground } from "@/lib/site-background";

type MainLayoutProps = {
  children: React.ReactNode;
  site: SiteConfig;
};

export function MainLayout({ children, site }: MainLayoutProps) {
  const backgroundVariant = site.siteBackground ?? resolveSiteBackground(site.homepageLayout);

  return (
    <>
      <SiteScrollBackground variant={backgroundVariant} />
      <Navbar name={site.name} navigation={site.navigation} />
      <main className="relative flex-1">{children}</main>
      <Footer site={site} />
      <TranslationDisclaimer />
    </>
  );
}
