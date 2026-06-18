import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { recordCmsSaveFailure } from "@/lib/app-diagnostics";
import { requireAdminSession } from "@/lib/require-admin-session";
import { sitePatchSchema, siteUpdateSchema, formatZodErrors } from "@/lib/validators";
import { parseSiteSocialConfig } from "@/lib/site-social";
import { DEFAULT_SITE_BRANDING, parseSiteBranding } from "@/lib/site-branding";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const record = await prisma.siteConfig.findFirst();
  if (!record) {
    return NextResponse.json({ error: "Site config not found." }, { status: 404 });
  }

  return NextResponse.json(record);
}

function buildSiteData(data: Record<string, unknown>) {
  const siteData: Record<string, unknown> = {};

  if (data.name !== undefined) siteData.name = data.name;
  if (data.tagline !== undefined) siteData.tagline = data.tagline;
  if (data.contactEmail !== undefined) siteData.contactEmail = data.contactEmail;
  if (data.contactPhone !== undefined) siteData.contactPhone = data.contactPhone;
  if (data.contactAddress !== undefined) siteData.contactAddress = data.contactAddress;
  if (data.social !== undefined) {
    siteData.social = parseSiteSocialConfig(data.social);
  }
  if (data.branding !== undefined) {
    siteData.branding = parseSiteBranding(data.branding);
  }
  if (data.navigation !== undefined) siteData.navigation = data.navigation;
  if (data.homepageLayout !== undefined) siteData.homepageLayout = data.homepageLayout;
  if (data.homepageSections !== undefined) siteData.homepageSections = data.homepageSections;
  if (data.timelineStyleDefaults !== undefined) siteData.timelineStyleDefaults = data.timelineStyleDefaults;
  if (data.timelineStyleByPage !== undefined) siteData.timelineStyleByPage = data.timelineStyleByPage;

  return siteData;
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

  const record = await prisma.siteConfig.findFirst();
  const schema = record ? sitePatchSchema : siteUpdateSchema;
  const validation = schema.safeParse(payload);

  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed.", details: formatZodErrors(validation.error) },
      { status: 422 },
    );
  }

  const siteData = buildSiteData(validation.data as Record<string, unknown>);

  try {
    const result = record
      ? await prisma.siteConfig.update({ where: { id: record.id }, data: siteData })
      : await prisma.siteConfig.create({
          data: {
            name: validation.data.name!,
            tagline: validation.data.tagline!,
            contactEmail: validation.data.contactEmail!,
            contactPhone: validation.data.contactPhone ?? "",
            contactAddress: validation.data.contactAddress!,
            social: parseSiteSocialConfig(validation.data.social ?? null),
            branding: validation.data.branding ?? DEFAULT_SITE_BRANDING,
            ...siteData,
          },
        });

    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    revalidatePath("/just-art-life");

    return NextResponse.json(result);
  } catch (error) {
    recordCmsSaveFailure("site config", error);
    return NextResponse.json({ error: "Unable to save site config." }, { status: 500 });
  }
}
