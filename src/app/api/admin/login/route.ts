import { NextResponse } from "next/server";
import { getAdminRedirectPath } from "@/lib/admin-auth-shared";
import { recordDiagnosticEvent } from "@/lib/app-diagnostics";

export async function POST(request: Request) {
  recordDiagnosticEvent("LOGIN_FAILURE", "Legacy secret-key login rejected", {
    reason: "Use GitHub OAuth",
  });

  const getHeader = (name: string) => request.headers.get(name);
  const contentType = request.headers.get("content-type") ?? "";
  const accept = request.headers.get("accept") ?? "";
  const wantsJson =
    contentType.includes("application/json") || accept.includes("application/json");

  const message = "Secret-key login is disabled. Sign in with GitHub.";

  if (wantsJson) {
    return NextResponse.json({ error: message }, { status: 410 });
  }

  return NextResponse.redirect(getAdminRedirectPath(getHeader, message, request.url), 303);
}
