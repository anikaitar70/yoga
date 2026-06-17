import type {
  CustomTextSectionPayload,
  JourneyHighlightPayload,
  TimelineItemPayload,
} from "@/lib/page-section-types";
import {
  formatTimelineSequenceNumber,
  mergeTimelineStyle,
  type TimelineStyleSettings,
  type TimelineStyleSiteConfig,
} from "@/lib/timeline-style";
import type { PageType } from "@/lib/page-section-types";

/** Split paragraphs into intro / body / closing using payload layout counts. */
export function splitJourneyParagraphs(
  paragraphs: string[],
  introParagraphCount = 2,
  closingParagraphCount = 0,
) {
  const introEnd = Math.min(introParagraphCount, paragraphs.length);
  const closingStart = Math.max(introEnd, paragraphs.length - closingParagraphCount);
  return {
    intro: paragraphs.slice(0, introEnd),
    body: paragraphs.slice(introEnd, closingStart),
    closing: paragraphs.slice(closingStart),
    introEnd,
  };
}

function isManualTimelineMode(
  timeline: NonNullable<CustomTextSectionPayload["timeline"]> | undefined,
): boolean {
  if (!timeline) return false;
  if (timeline.mode === "manual") return true;
  if (timeline.mode === "linked") return false;
  return Boolean(timeline.items?.some((item) => item.text?.trim()));
}

function withSequenceNumbers(items: Array<{ text: string; title?: string }>): TimelineItemPayload[] {
  return items
    .filter((item) => item.text.trim())
    .map((item, index) => ({
      number: formatTimelineSequenceNumber(index),
      text: item.text,
      ...(item.title?.trim() ? { title: item.title.trim() } : {}),
    }));
}

/** Timeline rows for art journey — numbers always follow visible render order from 01. */
export function resolveTimelineItems(
  payload: Pick<CustomTextSectionPayload, "timeline" | "introParagraphCount"> | null | undefined,
  bodyParagraphs: string[],
  _introEnd: number,
): TimelineItemPayload[] {
  const timeline = payload?.timeline;
  if (timeline?.enabled === false) {
    return [];
  }

  if (isManualTimelineMode(timeline)) {
    return withSequenceNumbers(timeline?.items ?? []);
  }

  return withSequenceNumbers(bodyParagraphs.map((text) => ({ text })));
}

/** Experience timeline keeps CMS year labels — not sequence numbers. */
export function resolveExperienceTimelineItems(
  payload: Pick<CustomTextSectionPayload, "timeline"> | null | undefined,
): TimelineItemPayload[] {
  const items = payload?.timeline?.items ?? [];
  return items.filter((item) => item.number?.trim() && item.text?.trim());
}

export function resolveTimelineStyleForSection(
  pageType: PageType,
  payload: Pick<CustomTextSectionPayload, "timelineStyle"> | null | undefined,
  site?: TimelineStyleSiteConfig | null,
  override?: TimelineStyleSettings | null,
): TimelineStyleSettings {
  return mergeTimelineStyle(
    site?.timelineStyleDefaults,
    site?.timelineStyleByPage?.[pageType],
    payload?.timelineStyle,
    override,
  );
}

export function highlightsEnabled(
  payload: Pick<CustomTextSectionPayload, "highlightsEnabled"> | null | undefined,
): boolean {
  if (payload?.highlightsEnabled === false) {
    return false;
  }
  return true;
}

export function activeHighlights(
  highlights: JourneyHighlightPayload[] | undefined,
  enabled: boolean,
): JourneyHighlightPayload[] {
  if (!enabled || !highlights?.length) {
    return [];
  }
  return highlights.filter((item) => item.enabled !== false && item.text.trim());
}

export function sutraEnabled(payload: CustomTextSectionPayload | null | undefined): boolean {
  if (!payload?.sutra) {
    return false;
  }
  if (payload.sutraEnabled === false || payload.sutra.enabled === false) {
    return false;
  }
  return Boolean(payload.sutra.sanskrit?.trim() && payload.sutra.translation?.trim());
}

export function paragraphsFromPayload(
  payload: CustomTextSectionPayload | null | undefined,
  content: string | null | undefined,
): string[] {
  if (payload?.paragraphs?.length) {
    return payload.paragraphs;
  }
  if (!content?.trim()) {
    return [];
  }
  return content
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Strip stale stored sequence numbers from art-journey payloads on save. */
export function normalizeArtJourneyTimelinePayload(
  payload: CustomTextSectionPayload,
): CustomTextSectionPayload {
  if (payload.variant !== "art-journey" || !payload.timeline) {
    return payload;
  }

  const items = (payload.timeline.items ?? [])
    .filter((item) => item.text?.trim())
    .map((item) => ({
      text: item.text.trim(),
      number: "",
      ...(item.title?.trim() ? { title: item.title.trim() } : {}),
    }));

  return {
    ...payload,
    timeline: {
      ...payload.timeline,
      items,
      numbers: undefined,
    },
  };
}
