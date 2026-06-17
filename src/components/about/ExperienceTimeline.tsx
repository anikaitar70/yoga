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
};

export function ExperienceTimeline({ title, items, timelineStyle }: ExperienceTimelineProps) {
  return (
    <TimelineStyleShell style={timelineStyle}>
      <VerticalTimelineList title={title} items={items} />
    </TimelineStyleShell>
  );
}
