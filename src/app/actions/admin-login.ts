"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminRedirectPath } from "@/lib/admin-auth-shared";
import { recordDiagnosticEvent } from "@/lib/app-diagnostics";

export type AdminLoginState = { error?: string } | null;

/** Legacy secret-key login — disabled in favor of GitHub OAuth. */
export async function submitAdminLogin(): Promise<void> {
  recordDiagnosticEvent("LOGIN_FAILURE", "Legacy secret-key login rejected", {
    reason: "Use GitHub OAuth",
  });

  const headerStore = await headers();
  const getHeader = (name: string) => headerStore.get(name);
  redirect(
    getAdminRedirectPath(
      getHeader,
      "Secret-key login is disabled. Sign in with GitHub.",
    ),
  );
}
