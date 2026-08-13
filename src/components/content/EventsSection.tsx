import { fetchEvents } from "@/content";
import { loadSiteConfigRowForLocale } from "@/content/repositories/site-locale";
import { getLocale } from "@/lib/i18n/server";
import { partitionEventsForEventsPage } from "@/lib/events-page-listing";
import { EventsPageListing } from "@/components/content/EventsPageListing";

/** Main Events page listing — grid layout with Special / Normal groups. */
export async function EventsSection() {
  const [events, locale, localeContent] = await Promise.all([
    fetchEvents(),
    getLocale(),
    loadSiteConfigRowForLocale(),
  ]);

  const { specialEvents, normalEvents } = partitionEventsForEventsPage(events);

  return (
    <EventsPageListing
      specialEvents={specialEvents}
      normalEvents={normalEvents}
      locale={locale}
      localeContent={localeContent}
    />
  );
}
