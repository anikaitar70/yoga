import { unstable_cache } from "next/cache";
import { readEventsPageSettings } from "@/lib/events-page-settings-store";
import type { EventsPageSettings } from "@/lib/events-page-settings";
import { EVENTS_CACHE_TAG } from "@/lib/revalidate-events";

const getEventsPageSettingsCached = unstable_cache(
  readEventsPageSettings,
  ["events-page-settings"],
  { tags: [EVENTS_CACHE_TAG, "site-config"] },
);

export async function fetchEventsPageSettings(): Promise<EventsPageSettings> {
  return getEventsPageSettingsCached();
}
