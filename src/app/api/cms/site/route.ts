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
  if (data.designSettingsByPage !== undefined) {
    siteData.designSettingsByPage = data.designSettingsByPage;
  }
  if (data.designSettings !== undefined) {
    siteData.designSettings = parseDesignSettings(data.designSettings);
  }

  return siteData;
}

function logSiteSave(stage: string, details: Record<string, unknown>) {
  console.info("[cms/site]", JSON.stringify({ stage, at: new Date().toISOString(), ...details }));
}

function formatSaveError(error: unknown) {
  const err = error instanceof Error ? error : new Error(String(error));
  return {
    name: err.name,
    message: err.message,
    stack: err.stack,
  };
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    logSiteSave("json_parse_failed", formatSaveError(error));
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  logSiteSave("incoming_payload", {
    keys: Object.keys(payload as Record<string, unknown>),
    hasDesignSettings: (payload as Record<string, unknown>).designSettings !== undefined,
    hasBranding: (payload as Record<string, unknown>).branding !== undefined,
  });

  const record = await findSiteConfigRecord();
  const schema = record ? sitePatchSchema : siteUpdateSchema;
  const validation = schema.safeParse(payload);

  if (!validation.success) {
    const details = formatZodErrors(validation.error);
    logSiteSave("validation_failed", {
      details,
      zodName: validation.error.name,
    });
    logBrandingTrace("site_save_validation_failed", {
      details,
      requestJaaLogo: jaaLogoFromUnknown((payload as Record<string, unknown>).branding),
    });
    return NextResponse.json(
      { error: "Validation failed.", details },
      { status: 422 },
    );
  }

  logSiteSave("validation_ok", {
    keys: Object.keys(validation.data as Record<string, unknown>),
  });

  const siteData = buildSiteData(validation.data as Record<string, unknown>);
  const requestPayload = payload as Record<string, unknown>;

  logSiteSave("parsed_payload", {
    keys: Object.keys(siteData),
    designSettingsPreview: siteData.designSettings
      ? {
          colors: (siteData.designSettings as { colors?: unknown }).colors,
          headerLayout: (siteData.designSettings as { headerLayout?: unknown }).headerLayout,
        }
      : null,
  });

  logBrandingTrace("site_save_request", {
    hasBranding: requestPayload.branding !== undefined,
    requestJaaLogo: jaaLogoFromUnknown(requestPayload.branding),
    parsedJaaLogo: jaaLogoFromUnknown(siteData.branding),
    existingConfigId: record?.id ?? null,
  });

  try {
    const result = await updateSiteConfigRecord(siteData);

    const verify = await findSiteConfigRecord();
    logSiteSave("save_ok", {
      savedConfigId: result.id,
      verifyHasDesignSettings: verify?.designSettings != null,
    });
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
    const formatted = formatSaveError(error);
    logSiteSave("save_failed", formatted);
    recordCmsSaveFailure("site config", error);
    return NextResponse.json(
      {
        error: "Unable to save site config.",
        exception: formatted.name,
        message: formatted.message,
      },
      { status: 500 },
    );
  }
}
