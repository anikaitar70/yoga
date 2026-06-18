import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/require-admin-session";
import { collectAnalytics } from "@/lib/analytics";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const analytics = await collectAnalytics();
  return NextResponse.json(analytics);
}
