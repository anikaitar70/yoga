import Image from "next/image";
import type { PageSectionRecord } from "@/lib/page-section-types";
import type { DynamicImageTextPayload } from "@/lib/page-section-types";
import { isLocalUploadUrl } from "@/lib/upload-url";
import { sanitizeRichTextHtml } from "@/lib/rich-text-server";
import { RichText } from "@/components/content/RichText";
import { TextContainer } from "@/components/content/TextContainer";
import { LayoutAwareSectionContainer } from "@/components/content/sections/LayoutAwareSectionContainer";
import { ProgramSectionShell } from "@/components/program/ProgramSectionShell";
import { SectionBrandTitle } from "@/components/ui/SectionBrandTitle";
import { resolveSectionTitleBrand } from "@/lib/section-title-brand";
import { getLocale } from "@/lib/i18n/server";
import { normalizeImageTextPayloadForRender } from "@/lib/page-section-payloads";

type Props = {
  section: PageSectionRecord;
  pageType: string;
  sectionIndex?: number;
};

const IMAGE_HEIGHT_MAP: Record<string, string> = {
  auto: "auto",
  small: "240px",
  medium: "360px",
  large: "500px",
};

function resolveImageHeight(payload: DynamicImageTextPayload | null | undefined): string | undefined {
  const preset = payload?.imageHeight ?? "medium";
  return IMAGE_HEIGHT_MAP[preset] ?? IMAGE_HEIGHT_MAP.medium;
}

export async function DynamicImageTextSectionBlock({ section, pageType, sectionIndex = 0 }: Props) {
  const rawPayload = section.payload as DynamicImageTextPayload | null;
  const payload = normalizeImageTextPayloadForRender({
    sectionType: section.sectionType,
    content: section.content,
    imageUrl: section.imageUrl,
    imageAlt: section.imageAlt,
    payload: rawPayload,
  }) as DynamicImageTextPayload;
  const items = Array.isArray(payload.items) ? payload.items : [];
  const locale = await getLocale();
  const isJa = locale === "ja";
  const scrollBehavior = payload.scrollBehavior ?? "sticky";
  const layoutDirection = payload.layoutDirection ?? "image-left";
  const imageFit = payload.imageFit ?? "cover";
  const imageHeight = resolveImageHeight(payload);
  const isSticky = scrollBehavior === "sticky";
  const titleBrand = resolveSectionTitleBrand(section, pageType as Parameters<typeof resolveSectionTitleBrand>[1]);

  if (items.length === 0) {
    return (
      <ProgramSectionShell layout={section.layout} sectionType="DYNAMIC_IMAGE_TEXT" sectionIndex={sectionIndex}>
        <LayoutAwareSectionContainer layout={section.layout}>
          {section.title ? (
            <SectionBrandTitle
              titleBrand={titleBrand}
              title={section.title}
              subtitle={section.subtitle}
              align="left"
              headingOffset={section.layout?.headingOffset}
              headingGap={section.layout?.headingGap}
            />
          ) : null}
          <p className="mt-8 text-sm text-muted">No items configured.</p>
        </LayoutAwareSectionContainer>
      </ProgramSectionShell>
    );
  }

  return (
    <ProgramSectionShell layout={section.layout} sectionType="DYNAMIC_IMAGE_TEXT" sectionIndex={sectionIndex}>
      <LayoutAwareSectionContainer layout={section.layout}>
        {section.title || section.subtitle ? (
          <SectionBrandTitle
            titleBrand={titleBrand}
            title={section.title}
            subtitle={section.subtitle}
            align="left"
            headingOffset={section.layout?.headingOffset}
            headingGap={section.layout?.headingGap}
          />
        ) : null}
        <div className="mt-10 flex flex-col gap-12 lg:gap-16">
          {items.map((item, idx) => {
            const htmlRaw = isJa && item.contentJa?.trim() ? item.contentJa : item.content;
            const safeHtml = sanitizeRichTextHtml(htmlRaw ?? "");
            const imageOnLeft = layoutDirection === "image-left";
            // Order classes for desktop: image left vs right
            const imageOrderClass = imageOnLeft ? "lg:order-1" : "lg:order-2";
            const textOrderClass = imageOnLeft ? "lg:order-2" : "lg:order-1";

            return (
              <div
                key={item.id ?? `${idx}-${item.imageUrl}`}
                className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10 lg:items-start"
              >
                {/* Image column */}
                <div
                  className={`${imageOrderClass} ${isSticky ? "lg:sticky lg:top-24 lg:self-start" : "self-start"}`}
                  style={isSticky ? { alignSelf: "start" } : undefined}
                >
                  <div
                    className={`relative w-full overflow-hidden rounded-xl border border-border bg-card ${imageFit === "contain" ? "bg-surface-warm" : ""} ${imageHeight === "auto" ? "aspect-[4/3]" : ""}`}
                    style={
                      imageHeight !== "auto"
                        ? {
                            height: imageHeight,
                            minHeight: imageHeight,
                          }
                        : undefined
                    }
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.imageAlt || `Section image ${idx + 1}`}
                        fill
                        className={imageFit === "contain" ? "object-contain p-2" : "object-cover"}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        unoptimized={isLocalUploadUrl(item.imageUrl)}
                      />
                    ) : null}
                  </div>
                </div>

                {/* Text column */}
                <div className={`${textOrderClass} min-w-0 self-start`}>
                  <TextContainer settings={section.layout?.textContainer}>
                    {safeHtml ? (
                      <div className="prose prose-neutral max-w-none rich-text">
                        <RichText html={safeHtml} variant="div" />
                      </div>
                    ) : (
                      <p className="text-sm text-muted">No content.</p>
                    )}
                  </TextContainer>
                </div>
              </div>
            );
          })}
        </div>
      </LayoutAwareSectionContainer>
    </ProgramSectionShell>
  );
}
