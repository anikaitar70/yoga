import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/MainLayout";
import { BrandingProvider } from "@/components/branding/BrandingProvider";
import { BRAND_NAME, FAVICON_SRC } from "@/lib/brand";
import { getMetadataBase } from "@/lib/site";
import { fetchSite } from "@/content";
import { contactLocationLabel, seoLocationKeywords } from "@/lib/site-contact";
import { DesignSettingsProvider } from "@/components/design/DesignSettingsProvider";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { parseDesignSettings } from "@/lib/design-settings";
import { getLocale } from "@/lib/i18n/server";
import { DEFAULT_LOGO_SRC } from "@/lib/site-branding";

/** Runtime rendering — DB is only available when the app container runs, not at Docker build time. */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const site = await fetchSite();
  const location = contactLocationLabel(site.contact);
  const locationPhrase = location ? ` in ${location}` : "";
  const logoSrc = site.branding.nirvanaYoga.logoSrc || DEFAULT_LOGO_SRC.nirvanaYoga;
  const isJa = locale === "ja";

  return {
    metadataBase: getMetadataBase(),
    title: {
      default: isJa
        ? `${site.name} · ヨガ、アート、ライフスタイル`
        : `${site.name} · Yoga, Art & Lifestyle`,
      template: `%s · ${site.name}`,
    },
    description: isJa
      ? `ヨガ、創造的な実践、意識的な暮らしのための穏やかなスタジオ。クラス、ワークショップ、コミュニティ${location ? `（${location}）` : ""}。`
      : `A calm studio for yoga, creative practice, and intentional living. Classes, workshops, and community${locationPhrase}.`,
    keywords: seoLocationKeywords(site.contact),
    openGraph: {
      type: "website",
      locale: isJa ? "ja_JP" : "en_US",
      alternateLocale: isJa ? ["en_US"] : ["ja_JP"],
      siteName: site.name || BRAND_NAME,
      title: isJa
        ? `${site.name || BRAND_NAME} · ヨガ、アート、ライフスタイル`
        : `${site.name || BRAND_NAME} · Yoga, Art & Lifestyle`,
      description: isJa
        ? "動きと静けさ、創造的な暮らし — 温かさと明晰さを大切に。"
        : "Movement, stillness, and creative living—held with warmth and clarity.",
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
  const locale = await getLocale();
  const site = await fetchSite();

  return (
    <LocaleProvider locale={locale}>
      <BrandingProvider
        branding={site.branding}
        key={`${site.branding.nirvanaYoga.logoSrc}|${site.branding.justArtAffaire.logoSrc}|${site.branding.nirvanaYoga.logoScale}|${site.branding.justArtAffaire.logoScale}`}
      >
        <DesignSettingsProvider settings={parseDesignSettings(site.designSettings ?? null)}>
          <MainLayout site={site}>{children}</MainLayout>
        </DesignSettingsProvider>
      </BrandingProvider>
    </LocaleProvider>
  );
}
