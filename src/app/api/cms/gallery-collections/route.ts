import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const collections = await prisma.galleryCollection.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { images: true, collages: true } },
    },
  });

  return NextResponse.json(collections);
}
