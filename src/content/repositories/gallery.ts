import type { GalleryItem } from "@/content/types";
import { resolveContent } from "@/content/utils";
import { prisma } from "@/lib/prisma";

const fallbackGalleryItems: GalleryItem[] = [
  {
    id: "g1",
    src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    alt: "Peaceful yoga space with plants",
    aspectClass: "aspect-[4/5]",
  },
  {
    id: "g2",
    src: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80",
    alt: "Hands in meditation gesture",
    aspectClass: "aspect-square",
  },
  {
    id: "g3",
    src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80",
    alt: "Yoga mat and props in soft light",
    aspectClass: "aspect-[3/4]",
  },
  {
    id: "g4",
    src: "https://images.unsplash.com/photo-1499951360447-b19be2787ed4?w=800&q=80",
    alt: "Minimal desk with notebook",
    aspectClass: "aspect-[4/5]",
  },
  {
    id: "g5",
    src: "https://images.unsplash.com/photo-1518241353330-799fe65c5489?w=800&q=80",
    alt: "Outdoor yoga at sunrise",
    aspectClass: "aspect-square",
  },
  {
    id: "g6",
    src: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&q=80",
    alt: "Ceramic cups and linen",
    aspectClass: "aspect-[3/4]",
  },
  {
    id: "g7",
    src: "https://images.unsplash.com/photo-1510894347713-fc3ed6dff449?w=800&q=80",
    alt: "Studio wooden floor",
    aspectClass: "aspect-[4/5]",
  },
  {
    id: "g8",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80",
    alt: "Portrait in natural light",
    aspectClass: "aspect-square",
  },
  {
    id: "g9",
    src: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800&q=80",
    alt: "Brush and watercolor palette",
    aspectClass: "aspect-[3/4]",
  },
];

export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  const records = await prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" } });
  if (records.length === 0) {
    return resolveContent([...fallbackGalleryItems]);
  }

  return resolveContent(
    records.map((item) => ({
      id: item.id,
      src: item.url,
      alt: item.altText ?? "",
      aspectClass: undefined,
    })),
  );
}
