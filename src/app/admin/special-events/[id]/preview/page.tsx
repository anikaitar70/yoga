import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SpecialEventPreviewStudio } from "@/components/admin/SpecialEventPreviewStudio";
import { specialEventPublicPath } from "@/lib/event-page-section";
import { mapEventPageSection } from "@/lib/event-page-section";

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

  return (
    <SpecialEventPreviewStudio
      eventId={event.id}
      eventSlug={event.slug}
      publicPath={publicPath}
      sections={sections}
    />
  );
}
