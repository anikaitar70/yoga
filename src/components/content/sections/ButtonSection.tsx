import type { PageSectionRecord, ButtonSectionPayload } from "@/lib/page-section-types";
import { sanitizeRichTextHtml } from "@/lib/rich-text-server";
import { RichText } from "@/components/content/RichText";
import { LayoutAwareSectionContainer } from "@/components/content/sections/LayoutAwareSectionContainer";
import { ProgramSectionShell } from "@/components/program/ProgramSectionShell";
import { SectionBrandTitle } from "@/components/ui/SectionBrandTitle";
import { resolveSectionTitleBrand } from "@/lib/section-title-brand";
import { Button } from "@/components/ui/Button";
import { getLocale } from "@/lib/i18n/server";
import { localizedPath } from "@/lib/i18n/paths";
import { isExternalEventCtaUrl } from "@/lib/event-cta-url";

type Props = {
  section: PageSectionRecord;
  pageType: string;
  sectionIndex?: number;
};

export async function ButtonSectionBlock({ section, pageType, sectionIndex = 0 }: Props) {
  const payload = (section.payload as ButtonSectionPayload | null) ?? { label: "", href: "/contact" };
  const locale = await getLocale();
  const isJa = locale === "ja";
  const label = isJa && payload.labelJa?.trim() ? payload.labelJa : payload.label || section.title || "Learn more";
  let href = (payload.href || "/contact").trim() || "/contact";
  // Normalize bare paths (e.g. "contact" -> "/contact") and localize internal links
  if (!/^https?:\/\//i.test(href) && !href.startsWith("/")) href = `/${href}`;
  const isExternal = payload.targetBlank ?? isExternalEventCtaUrl(href);
  const finalHref = isExternal ? href : localizedPath(href, locale);
  const supportingRaw = isJa && payload.supportingTextJa?.trim() ? payload.supportingTextJa : payload.supportingText;
  const supporting = supportingRaw ? sanitizeRichTextHtml(supportingRaw) : "";
  const alignment = payload.alignment ?? "center";
  const variant = (payload.variant as "primary" | "secondary" | "ghost" | "warm") ?? "primary";
  const size = payload.size ?? "md";
  const titleBrand = resolveSectionTitleBrand(section, pageType as Parameters<typeof resolveSectionTitleBrand>[1]);
  const headingAlign = section.layout?.textAlignment === "center" ? "center" : alignment === "center" ? "center" : alignment;

  const sizeClass = size === "lg" ? "px-8 py-4 text-base" : size === "sm" ? "px-4 py-2 text-sm" : "px-6 py-3 text-sm";
  const alignClass = alignment === "left" ? "justify-start" : alignment === "right" ? "justify-end" : "justify-center";

  return (
    <ProgramSectionShell layout={section.layout} sectionType="BUTTON" sectionIndex={sectionIndex}>
      <LayoutAwareSectionContainer layout={section.layout}>
        {section.title || section.subtitle ? (
          <SectionBrandTitle titleBrand={titleBrand} title={section.title} subtitle={section.subtitle} align={headingAlign as "left" | "center"} />
        ) : null}
        {supporting ? (
          <div className={`mx-auto max-w-2xl ${alignment === "left" ? "ml-0" : alignment === "right" ? "ml-auto mr-0" : ""}`}>
            <RichText html={supporting} variant="div" className="rich-text prose prose-neutral max-w-none text-center text-muted" />
          </div>
        ) : null}
        <div className={`mt-8 flex ${alignClass}`}>
          <Button href={finalHref} variant={variant} external={isExternal} className={sizeClass}>
            {label}
          </Button>
        </div>
      </LayoutAwareSectionContainer>
    </ProgramSectionShell>
  );
}
