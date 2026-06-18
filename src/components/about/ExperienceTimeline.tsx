import { TimelineStyleShell } from "@/components/content/timeline/TimelineStyleShell";
import {
  VerticalTimelineList,
  type VerticalTimelineItem,
} from "@/components/content/timeline/VerticalTimelineList";
import type { TimelineStyleSettings } from "@/lib/timeline-style";

export type ExperienceTimelineItem = VerticalTimelineItem;

type ExperienceTimelineProps = {
  title?: string | null;
  items: ExperienceTimelineItem[];
  timelineStyle?: TimelineStyleSettings | null;
  staticReveal?: boolean;
};

export function ExperienceTimeline({
  title,
  items,
  timelineStyle,
  staticReveal = false,
}: ExperienceTimelineProps) {
  return (
    <TimelineStyleShell style={timelineStyle}>
      <VerticalTimelineList title={title} items={items} staticReveal={staticReveal} />
    </TimelineStyleShell>
  );
}
