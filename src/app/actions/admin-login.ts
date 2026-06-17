"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, verifyAdminSecret } from "@/lib/admin-auth";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_LEGACY_COOKIE_PATHS,
  getAdminCookieOptionsFromHeaders,
  getAdminRedirectPath,
} from "@/lib/admin-auth-shared";
import { logAuthTrace, maskSecret } from "@/lib/admin-auth-debug";

export type AdminLoginState = { error?: string } | null;

async function processLogin(formData: FormData): Promise<AdminLoginState> {
  const headerStore = await headers();
  const getHeader = (name: string) => headerStore.get(name);

  logAuthTrace("AUTH API", "Processing login", {
    host: getHeader("host"),
    forwardedHost: getHeader("x-forwarded-host"),
    forwardedProto: getHeader("x-forwarded-proto"),
  });

  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  if (!ADMIN_SECRET) {
    return { error: "Admin secret is not configured." };
  }

  const secret = String(formData.get("secret") ?? "");

  logAuthTrace("AUTH API", "Login body", {
    secretMasked: maskSecret(secret),
    hasSecret: Boolean(secret),
  });

  if (!secret.trim()) {
    return { error: "Enter your secret key." };
  }

  const authorized = verifyAdminSecret(secret, ADMIN_SECRET);

  logAuthTrace("AUTH API", "Validation result", { credentialsMatched: authorized });

  if (!authorized) {
    return { error: "Unauthorized." };
  }

  const cookieOptions = getAdminCookieOptionsFromHeaders(getHeader);
  const sessionToken = createSessionToken(ADMIN_SECRET);
  const cookieStore = await cookies();

  cookieStore.set({
    ...cookieOptions,
    value: sessionToken,
  });

  for (const legacyPath of ADMIN_LEGACY_COOKIE_PATHS) {
    cookieStore.set({
      ...cookieOptions,
      path: legacyPath,
      value: "",
      maxAge: 0,
    });
  }

  logAuthTrace("COOKIE", "Session cookie set", {
    cookieName: ADMIN_COOKIE_NAME,
    secure: cookieOptions.secure,
    path: cookieOptions.path,
    tokenLength: sessionToken.length,
  });

  return null;
}

/** Direct form action — React sets method/post automatically for function actions. */
export async function submitAdminLogin(formData: FormData): Promise<void> {
  console.error("[AUTH API] LOGIN SERVER ACTION HIT", { at: new Date().toISOString() });

  const headerStore = await headers();
  const getHeader = (name: string) => headerStore.get(name);

  const result = await processLogin(formData);
  if (result?.error) {
    console.error("[AUTH API] LOGIN FAILED", { error: result.error });
    const target = getAdminRedirectPath(getHeader, result.error);
    logAuthTrace("AUTH API", "Redirect after failure", { target });
    redirect(target);
  }

  const target = getAdminRedirectPath(getHeader);
  console.error("[AUTH API] LOGIN SERVER ACTION SUCCESS — redirecting", { target });
  redirect(target);
}
