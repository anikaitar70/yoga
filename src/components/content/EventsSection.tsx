import { fetchEvents } from "@/content";
import { fetchEventsPageSettings } from "@/content/repositories/events-page-settings";
import { loadSiteConfigRowForLocale } from "@/content/repositories/site-locale";
import { getLocale } from "@/lib/i18n/server";
import {
  partitionEventsForEventsPage,
  toEventsPageEventItems,
} from "@/lib/events-page-listing";
import { EventsPageListing } from "@/components/content/EventsPageListing";

/** Main Events page listing — hotel-style rows with Special Events / Regular Classes groups. */
export async function EventsSection() {
  const [events, locale, localeContent, pageSettings] = await Promise.all([
    fetchEvents(),
    getLocale(),
    loadSiteConfigRowForLocale(),
    fetchEventsPageSettings(),
  ]);

  const { specialEvents, regularClasses } = partitionEventsForEventsPage(events);

  return (
    <EventsPageListing
      specialEvents={toEventsPageEventItems(specialEvents, locale)}
      regularClasses={toEventsPageEventItems(regularClasses, locale)}
      locale={locale}
      localeContent={localeContent}
      specialEventsInitialCount={pageSettings.specialEventsInitialCount}
      regularClassesInitialCount={pageSettings.regularClassesInitialCount}
    />
  );
}
