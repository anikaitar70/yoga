import { hasPrismaDelegate, prisma } from "@/lib/prisma";

let gallerySchemaReady: boolean | null = null;

/**
 * Detects whether the loaded Prisma client matches the current gallery schema
 * (sortOrder, collection relation, collage models). Turbopack can serve a stale
 * bundled client until `.next` is cleared and `prisma generate` runs.
 */
export async function isGallerySchemaReady(): Promise<boolean> {
  if (gallerySchemaReady !== null) {
    return gallerySchemaReady;
  }

  if (!hasPrismaDelegate("galleryCollection") || !hasPrismaDelegate("galleryCollage")) {
    gallerySchemaReady = false;
    return false;
  }

  try {
    await prisma.galleryImage.findFirst({
      orderBy: { sortOrder: "asc" },
      select: { id: true },
    });
    gallerySchemaReady = true;
  } catch {
    gallerySchemaReady = false;
  }

  return gallerySchemaReady;
}

export function galleryImageOrderBy(ready: boolean) {
  return ready
    ? ([{ sortOrder: "asc" as const }, { createdAt: "desc" as const }] as const)
    : ([{ createdAt: "desc" as const }] as const);
}

export function resetGallerySchemaProbe() {
  gallerySchemaReady = null;
}
