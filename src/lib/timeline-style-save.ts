import type { PageType } from "@/lib/page-section-types";
import type { TimelineStyleScope, TimelineStyleSettings } from "@/lib/timeline-style";

type ApplyTimelineStyleScopeArgs = {
  scope: TimelineStyleScope | undefined;
  pageType: PageType;
  style: TimelineStyleSettings | undefined;
  getSite: () => Promise<Record<string, unknown>>;
  patchSite: (payload: Record<string, unknown>) => Promise<void>;
};

/** Persist timeline style scope to SiteConfig — mirrors section layout inheritance tiers. */
export async function applyTimelineStyleScope({
  scope,
  pageType,
  style,
  getSite,
  patchSite,
}: ApplyTimelineStyleScopeArgs): Promise<void> {
  if (!style || Object.keys(style).length === 0 || !scope || scope === "section") {
    return;
  }

  if (scope === "site") {
    await patchSite({ timelineStyleDefaults: style });
    return;
  }

  if (scope === "page") {
    const site = await getSite();
    const existing =
      site.timelineStyleByPage && typeof site.timelineStyleByPage === "object"
        ? (site.timelineStyleByPage as Record<string, TimelineStyleSettings>)
        : {};
    await patchSite({
      timelineStyleByPage: {
        ...existing,
        [pageType]: style,
      },
    });
  }
}
