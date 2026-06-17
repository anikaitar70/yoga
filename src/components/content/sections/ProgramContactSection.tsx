"use client";

import type { ContactSectionPayload } from "@/lib/page-section-types";
import type { SiteContact, SocialLink } from "@/content/types";
import { contentToParagraphs } from "@/lib/page-section-types";
import type { SectionLayoutSettings } from "@/lib/section-layout";
import { resolveSectionLayout } from "@/lib/section-layout";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Prose } from "@/components/ui/Prose";
import { Button } from "@/components/ui/Button";
import { ProgramInquiryForm } from "@/components/contact/ProgramInquiryForm";
import { StudioContactLinks } from "@/components/content/StudioContactLinks";
import { SocialLinks } from "@/components/content/SocialLinks";
import { ProgramSectionShell } from "@/components/program/ProgramSectionShell";
import { useProgramTheme } from "@/components/program/ProgramThemeProvider";
import { cn } from "@/lib/utils";

type ProgramContactSectionProps = {
  title: string;
  subtitle?: string;
  content?: string | null;
  payload: ContactSectionPayload;
  layout?: SectionLayoutSettings | null;
  sectionIndex?: number;
  contact: SiteContact;
  social?: SocialLink[];
};

function ProgramContactInner({
  title,
  subtitle,
  content,
  payload,
  layout,
  contact,
  social = [],
}: Omit<ProgramContactSectionProps, "sectionIndex">) {
  const theme = useProgramTheme();
  const resolved = resolveSectionLayout(layout);
  const paragraphs = contentToParagraphs(content);

  return (
    <div className={resolved.contentWidth}>
      <SectionHeading
        title={title}
        subtitle={subtitle}
        align={layout?.textAlignment === "center" ? "center" : "left"}
      />
      {paragraphs.length ? (
        <Prose className={cn("mb-10", resolved.textMaxWidth, resolved.textAlignment)}>
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Prose>
      ) : null}
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        {payload.showForm !== false ? (
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
            <ProgramInquiryForm defaultSubject={payload.formSubject || title} />
          </div>
        ) : (
          <div />
        )}
        <div className="flex flex-col justify-center gap-6 rounded-2xl border border-primary/15 bg-primary-soft/25 p-8">
          <StudioContactLinks contact={contact} />
          {social.length > 0 ? <SocialLinks links={social} layout="stack" /> : null}
          {payload.ctaLabel && payload.ctaHref ? (
            <Button href={payload.ctaHref} variant={theme.ctaVariant}>
              {payload.ctaLabel}
            </Button>
          ) : (
            <Button href="/contact" variant={theme.ctaVariant}>
              Visit contact page
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProgramContactSection(props: ProgramContactSectionProps) {
  return (
    <ProgramSectionShell
      layout={props.layout}
      sectionType="CONTACT"
      sectionIndex={props.sectionIndex}
      className="bg-primary-soft/20"
    >
      <ProgramContactInner {...props} />
    </ProgramSectionShell>
  );
}
