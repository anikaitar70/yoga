import type { Metadata } from "next";
import { Suspense, ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageContent } from "@/components/page/PageContent";
import { ContentSkeleton } from "@/components/ui/ContentSkeleton";
import { fetchEventsByCategory } from "@/content/repositories/events";
import { EventList } from "@/components/content/EventList";
import { notFound } from "next/navigation";

interface Params {
  params: {
    category: string;
  };
}

const categoryMetadata: Record<
  string,
  { title: string; subtitle: string; description: string }
> = {
  yoga: {
    title: "Yoga Events",
    subtitle: "Classes, workshops, teacher training, and philosophy gatherings.",
    description: "Yoga events at Nirvana Yoga.",
  },
  "yoga-nidra": {
    title: "Yoga Nidra",
    subtitle: "Deep rest sessions and Yoga Nidra immersions.",
    description: "Yoga Nidra events at Nirvana Yoga.",
  },
  workshop: {
    title: "Workshops",
    subtitle: "Focused immersions and special-topic workshops.",
    description: "Workshops at Nirvana Yoga.",
  },
  "teacher-training": {
    title: "Teacher Training",
    subtitle: "Professional development and certification programs.",
    description: "Teacher training at Nirvana Yoga.",
  },
  philosophy: {
    title: "Philosophy",
    subtitle: "Study circles and contemplative learning.",
    description: "Philosophy events at Nirvana Yoga.",
  },
  healing: {
    title: "Healing Sessions",
    subtitle: "Supportive modalities for your wellness journey.",
    description: "Healing sessions and modalities at Nirvana Yoga.",
  },
  "just-art-life": {
    title: "Just Art Affaire",
    subtitle: "Creative rituals and lifestyle gatherings.",
    description: "Creative events and gatherings at Nirvana Yoga.",
  },
  retreat: {
    title: "Retreats",
    subtitle: "Immersive retreats in nature and sacred destinations.",
    description: "Yoga retreats at Nirvana Yoga.",
  },
  "retreats-and-tours": {
    title: "Retreats & Tours",
    subtitle: "Immersive experiences and travel programs.",
    description: "Yoga retreats and tours offered by Nirvana Yoga.",
  },
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const meta = categoryMetadata[params.category];
  if (!meta) {
    return { title: "Not Found" };
  }
  return {
    title: meta.title,
    description: meta.description,
  };
}

async function CategoryEventsSection({
  category,
}: {
  category: string;
}): Promise<ReactNode> {
  const events = await fetchEventsByCategory(category);
  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-slate-600">No events in this category yet.</p>
      </div>
    );
  }
  return <EventList events={events} />;
}

export default function CategoryEventsPage({ params }: Params) {
  const meta = categoryMetadata[params.category];

  if (!meta) {
    notFound();
  }

  return (
    <>
      <PageHeader title={meta.title} subtitle={meta.subtitle} />
      <PageContent>
        <Suspense fallback={<ContentSkeleton layout="events" count={2} />}>
          <CategoryEventsSection category={params.category} />
        </Suspense>
      </PageContent>
    </>
  );
}
