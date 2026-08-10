import Image from "next/image";
import type { EventDetailSection, ResolvedEventDetail } from "@/lib/event-detail";
import { Prose } from "@/components/ui/Prose";
import { SplitMediaLayout } from "@/components/content/SplitMediaLayout";
import { cn } from "@/lib/utils";

type EventDetailSectionsProps = {
  detail: ResolvedEventDetail;
  className?: string;
};

function SectionBody({ paragraphs }: { paragraphs: string[] }) {
  return (
    <Prose className="max-w-none">
      {paragraphs.filter(Boolean).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </Prose>
  );
}

function renderSection(section: EventDetailSection) {
  switch (section.type) {
    case "TEXT":
      if (!section.title && section.paragraphs.every((p) => !p.trim())) return null;
      return (
        <section key={section.id} className="space-y-4">
          {section.title ? (
            <h3 className="font-display text-2xl font-medium text-foreground sm:text-3xl">{section.title}</h3>
          ) : null}
          <SectionBody paragraphs={section.paragraphs} />
        </section>
      );
    case "IMAGE":
      if (!section.imageUrl) return null;
      return (
        <figure key={section.id} className="space-y-3">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-border/70">
            <Image
              src={section.imageUrl}
              alt={section.imageAlt || "Event image"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 92vw, 80vw"
              unoptimized={section.imageUrl.startsWith("/uploads/")}
            />
          </div>
          {section.caption ? (
            <figcaption className="text-center text-sm text-muted">{section.caption}</figcaption>
          ) : null}
        </figure>
      );
    case "IMAGE_TEXT": {
      if (!section.imageUrl && section.paragraphs.every((p) => !p.trim())) return null;
      const position = section.imagePosition ?? "left";
      if (position === "full" || !section.imageUrl) {
        return (
          <section key={section.id} className="space-y-6">
            {section.title ? (
              <h3 className="font-display text-2xl font-medium text-foreground sm:text-3xl">{section.title}</h3>
            ) : null}
            {section.imageUrl ? (
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-border/70">
                <Image
                  src={section.imageUrl}
                  alt={section.imageAlt || "Event image"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 92vw, 80vw"
                  unoptimized={section.imageUrl.startsWith("/uploads/")}
                />
              </div>
            ) : null}
            <SectionBody paragraphs={section.paragraphs} />
          </section>
        );
      }
      return (
        <section key={section.id} className="space-y-6">
          {section.title ? (
            <h3 className="font-display text-2xl font-medium text-foreground sm:text-3xl">{section.title}</h3>
          ) : null}
          <SplitMediaLayout
            image={{
              src: section.imageUrl,
              alt: section.imageAlt || "Event image",
              aspectClass: "aspect-[4/3]",
            }}
            imageSide={position}
          >
            <SectionBody paragraphs={section.paragraphs} />
          </SplitMediaLayout>
        </section>
      );
    }
    default:
      return null;
  }
}

export function EventDetailSections({ detail, className }: EventDetailSectionsProps) {
  return <div className={cn("space-y-10 sm:space-y-12", className)}>{detail.sections.map(renderSection)}</div>;
}
