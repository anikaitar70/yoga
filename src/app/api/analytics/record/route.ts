import { NextResponse } from "next/server";
import { normalizeAnalyticsPath, recordPageView } from "@/lib/analytics";
import { getAnalyticsInternalSecret } from "@/lib/analytics-shared";

function isAuthorizedInternalRequest(request: Request): boolean {
  const expected = getAnalyticsInternalSecret();
  const provided = request.headers.get("x-analytics-internal");
  return Boolean(provided && provided === expected);
}

export async function POST(request: Request) {
  if (!isAuthorizedInternalRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: { path?: unknown; visitorId?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const path = typeof payload.path === "string" ? payload.path : "";
  const visitorId = typeof payload.visitorId === "string" ? payload.visitorId : "";

  if (!path || !visitorId) {
    return NextResponse.json({ error: "Missing path or visitorId." }, { status: 400 });
  }

  try {
    await recordPageView(normalizeAnalyticsPath(path), visitorId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to record page view." }, { status: 500 });
  }
}
