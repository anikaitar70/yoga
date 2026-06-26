import type { Event } from "@/content/types";
import { EventListView } from "@/components/content/EventListView";
import { loadSiteConfigRowForLocale } from "@/content/repositories/site-locale";
import { getLocale } from "@/lib/i18n/server";

type EventListProps = {
  events: Event[];
  className?: string;
};

export async function EventList({ events, className }: EventListProps) {
  const [locale, localeContent] = await Promise.all([getLocale(), loadSiteConfigRowForLocale()]);
  return <EventListView events={events} locale={locale} localeContent={localeContent} className={className} />;
}
