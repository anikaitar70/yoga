import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/require-admin-session";
import { collectDiagnostics } from "@/lib/server-metrics";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const diagnostics = await collectDiagnostics();
  return NextResponse.json(diagnostics);
}
