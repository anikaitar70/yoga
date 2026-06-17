import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import { revalidateProgramPage } from "@/lib/revalidate-program-pages";
import { formatZodErrors, pageSectionReorderSchema } from "@/lib/validators";

export async function PATCH(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = pageSectionReorderSchema.safeParse(payload);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: formatZodErrors(validation.error) },
      { status: 422 },
    );
  }

  const { pageType, orderedIds } = validation.data;

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.pageSection.updateMany({
        where: { id, pageType },
        data: { sortOrder: index },
      }),
    ),
  );

  const sections = await prisma.pageSection.findMany({
    where: { pageType },
    orderBy: { sortOrder: "asc" },
  });

  revalidateProgramPage(pageType);

  return NextResponse.json(sections);
}
