import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SpecialEventPreviewStudio } from "@/components/admin/SpecialEventPreviewStudio";
import { specialEventPublicPath } from "@/lib/event-page-section";
import { mapEventPageSection } from "@/lib/event-page-section";
import { DesignSettingsProvider } from "@/components/design/DesignSettingsProvider";
import { parseDesignSettings } from "@/lib/design-settings";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function SpecialEventAdminPreview({ params }: Props) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { pageSections: { orderBy: { sortOrder: "asc" } } },
  });
  if (!event) notFound();

  const sections = event.pageSections.map((s) => mapEventPageSection(s));
  const publicPath = specialEventPublicPath(event.slug);
  const siteConfig = await prisma.siteConfig.findFirst();
  const designSettings = parseDesignSettings((siteConfig?.designSettings as unknown) ?? null);

  return (
    <DesignSettingsProvider settings={designSettings} applyToDocument={false}>
      <SpecialEventPreviewStudio
        eventId={event.id}
        eventSlug={event.slug}
        publicPath={publicPath}
        sections={sections}
      />
    </DesignSettingsProvider>
  );
}
