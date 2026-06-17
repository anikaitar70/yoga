"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { adminFetch, parseAdminJsonResponse } from "@/lib/admin-fetch";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { BRAND_NAME } from "@/lib/brand";

const LOGIN_PATH = "/api/admin/login";

export default function AdminLoginForm() {
  const searchParams = useSearchParams();
  const loginError = searchParams.get("login_error");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(loginError);

  useEffect(() => {
    if (loginError) setError(loginError);
  }, [loginError]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = event.currentTarget;
    const secret = new FormData(form).get("secret");
    const secretValue = typeof secret === "string" ? secret : "";

    try {
      const response = await adminFetch(LOGIN_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "1" },
        credentials: "include",
        body: JSON.stringify({ secret: secretValue }),
      });

      const parsed = await parseAdminJsonResponse<{ ok?: boolean; error?: string }>(response);

      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }

      if (!response.ok) {
        setError(parsed.data.error || "Unable to sign in.");
        return;
      }

      window.location.assign("/admin");
    } catch {
      setError("Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <BrandLogo context="admin" className="mx-auto max-w-[10rem]" />
      <h2 className="mt-6 text-xl font-semibold text-slate-900">{BRAND_NAME} admin</h2>
      <p className="mt-2 text-sm text-slate-600">Enter the secret key to access the admin dashboard.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Secret key
          <input
            name="secret"
            type="password"
            required
            autoComplete="current-password"
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </div>
  );
}
