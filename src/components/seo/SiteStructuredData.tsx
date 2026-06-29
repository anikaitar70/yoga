import { fetchSite } from "@/content";
import { getLocale } from "@/lib/i18n/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";

export async function SiteStructuredData() {
  const [site, locale] = await Promise.all([fetchSite(), getLocale()]);

  return (
    <JsonLd
      data={[organizationJsonLd(site), websiteJsonLd(site, locale)]}
    />
  );
}
