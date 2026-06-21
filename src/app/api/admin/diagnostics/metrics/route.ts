import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/require-admin-session";
import { collectSystemMetricsSample } from "@/lib/server-metrics";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const metrics = await collectSystemMetricsSample();
  return NextResponse.json(metrics, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
