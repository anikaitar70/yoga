import { NextResponse } from "next/server";
import { jaaLogoFromParsed, jaaLogoFromUnknown, logBrandingTrace } from "@/lib/branding-diagnostics";
import { recordCmsSaveFailure } from "@/lib/app-diagnostics";
import { requireAdminSession } from "@/lib/require-admin-session";
import { revalidateBrandingPaths } from "@/lib/revalidate-branding";
import { findSiteConfigRecord, updateSiteConfigRecord } from "@/lib/site-config-store";
import { sitePatchSchema, siteUpdateSchema, formatZodErrors } from "@/lib/validators";
import { parseSiteSocialConfig } from "@/lib/site-social";
import { parseSiteBranding } from "@/lib/site-branding";
import { parseDesignSettings } from "@/lib/design-settings";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const record = await findSiteConfigRecord();
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
  if (data.designSettings !== undefined) {
    siteData.designSettings = parseDesignSettings(data.designSettings);
  }

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

  const record = await findSiteConfigRecord();
  const schema = record ? sitePatchSchema : siteUpdateSchema;
  const validation = schema.safeParse(payload);

  if (!validation.success) {
    logBrandingTrace("site_save_validation_failed", {
      details: formatZodErrors(validation.error),
      requestJaaLogo: jaaLogoFromUnknown((payload as Record<string, unknown>).branding),
    });
    return NextResponse.json(
      { error: "Validation failed.", details: formatZodErrors(validation.error) },
      { status: 422 },
    );
  }

  const siteData = buildSiteData(validation.data as Record<string, unknown>);
  const requestPayload = payload as Record<string, unknown>;

  logBrandingTrace("site_save_request", {
    hasBranding: requestPayload.branding !== undefined,
    requestJaaLogo: jaaLogoFromUnknown(requestPayload.branding),
    parsedJaaLogo: jaaLogoFromUnknown(siteData.branding),
    existingConfigId: record?.id ?? null,
  });

  try {
    const result = await updateSiteConfigRecord(siteData);

    const verify = await findSiteConfigRecord();
    logBrandingTrace("site_save_result", {
      savedConfigId: result.id,
      responseJaaLogo: jaaLogoFromUnknown(result.branding),
      parsedResponseJaaLogo: jaaLogoFromParsed(result.branding),
      verifyConfigId: verify?.id ?? null,
      verifyJaaLogo: jaaLogoFromUnknown(verify?.branding),
      parsedVerifyJaaLogo: verify ? jaaLogoFromParsed(verify.branding) : null,
    });

    revalidateBrandingPaths();

    return NextResponse.json(result);
  } catch (error) {
    recordCmsSaveFailure("site config", error);
    return NextResponse.json({ error: "Unable to save site config." }, { status: 500 });
  }
}
