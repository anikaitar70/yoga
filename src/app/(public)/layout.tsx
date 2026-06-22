import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import { BrandingProvider } from "@/components/branding/BrandingProvider";
import { BRAND_NAME, FAVICON_SRC } from "@/lib/brand";
import { getMetadataBase } from "@/lib/site";
import { fetchSite } from "@/content";
import { contactLocationLabel, seoLocationKeywords } from "@/lib/site-contact";
import { DesignSettingsProvider } from "@/components/design/DesignSettingsProvider";
import { DEFAULT_DESIGN_SETTINGS } from "@/lib/design-settings";
import { DEFAULT_LOGO_SRC } from "@/lib/site-branding";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await fetchSite();
  const location = contactLocationLabel(site.contact);
  const locationPhrase = location ? ` in ${location}` : "";
  const logoSrc = site.branding.nirvanaYoga.logoSrc || DEFAULT_LOGO_SRC.nirvanaYoga;

  return {
    metadataBase: getMetadataBase(),
    title: {
      default: `${site.name} · Yoga, Art & Lifestyle`,
      template: `%s · ${site.name}`,
    },
    description: `A calm studio for yoga, creative practice, and intentional living. Classes, workshops, and community${locationPhrase}.`,
    keywords: seoLocationKeywords(site.contact),
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: site.name || BRAND_NAME,
      title: `${site.name || BRAND_NAME} · Yoga, Art & Lifestyle`,
      description:
        "Movement, stillness, and creative living—held with warmth and clarity.",
      images: [{ url: logoSrc, alt: BRAND_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: site.name || BRAND_NAME,
      description:
        `Yoga, art, and lifestyle—a calm studio community${locationPhrase}.`,
      images: [logoSrc],
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: [{ url: FAVICON_SRC, type: "image/jpeg" }],
      apple: [{ url: FAVICON_SRC, type: "image/jpeg" }],
      shortcut: [FAVICON_SRC],
    },
  };
}

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = await fetchSite();

  return (
    <BrandingProvider
      branding={site.branding}
      key={`${site.branding.nirvanaYoga.logoSrc}|${site.branding.justArtAffaire.logoSrc}|${site.branding.nirvanaYoga.logoScale}|${site.branding.justArtAffaire.logoScale}`}
    >
      <DesignSettingsProvider settings={site.designSettings ?? DEFAULT_DESIGN_SETTINGS}>
        <MainLayout site={site}>{children}</MainLayout>
      </DesignSettingsProvider>
    </BrandingProvider>
  );
}
