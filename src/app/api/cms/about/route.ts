import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import { aboutUpdateSchema, formatZodErrors } from "@/lib/validators";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const record = await prisma.aboutPage.findFirst();
  if (!record) {
    return NextResponse.json({ error: "About page not found." }, { status: 404 });
  }

  return NextResponse.json(record);
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = aboutUpdateSchema.safeParse(payload);
  if (!validation.success) {
    const details = formatZodErrors(validation.error);
    console.warn("[about-save:validation-failed]", { details, payload });
    return NextResponse.json({ error: "Validation failed.", details }, { status: 422 });
  }

  const record = await prisma.aboutPage.findFirst();
  const data = validation.data;

  const result = record
    ? await prisma.aboutPage.update({
        where: { id: record.id },
        data: {
          eyebrow: data.eyebrow,
          title: data.title,
          subtitle: data.subtitle,
        },
      })
    : await prisma.aboutPage.create({
        data: {
          id: "about",
          eyebrow: data.eyebrow,
          title: data.title,
          subtitle: data.subtitle,
          imageSrc:
            "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1000&q=80",
          imageAlt: data.title,
          paragraphs: [data.subtitle],
        },
      });

  revalidatePath("/about", "page");
  revalidatePath("/admin/content", "page");

  return NextResponse.json({
    id: result.id,
    eyebrow: result.eyebrow,
    title: result.title,
    subtitle: result.subtitle,
  });
}
