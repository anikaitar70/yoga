import { fetchHero, fetchSite } from "@/content";
import { DesignSettingsManager } from "@/components/admin/DesignSettingsManager";

export default async function AdminDesignPage() {
  const [site, hero] = await Promise.all([fetchSite(), fetchHero()]);

  return <DesignSettingsManager site={site} hero={hero} />;
}
