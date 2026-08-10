"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { BRAND_NAME } from "@/lib/brand";

const GITHUB_LOGIN_PATH = "/api/admin/auth/github";
const LOCAL_LOGIN_PATH = "/api/admin/auth/local";

type AdminLoginFormProps = {
  localLoginAvailable?: boolean;
};

export default function AdminLoginForm({ localLoginAvailable = false }: AdminLoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginError = searchParams.get("login_error");
  const [error, setError] = useState<string | null>(loginError);
  const [showLocalForm, setShowLocalForm] = useState(false);
  const [localAvailable, setLocalAvailable] = useState(localLoginAvailable);
  const [busy, setBusy] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (loginError) setError(loginError);
  }, [loginError]);

  useEffect(() => {
    if (localLoginAvailable) return;
    let cancelled = false;
    fetch(LOCAL_LOGIN_PATH, { credentials: "same-origin" })
      .then((res) => res.json())
      .then((data: { available?: boolean }) => {
        if (!cancelled) setLocalAvailable(Boolean(data.available));
      })
      .catch(() => {
        if (!cancelled) setLocalAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [localLoginAvailable]);

  async function submitLocalLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(LOCAL_LOGIN_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Unable to sign in.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <BrandLogo context="admin" className="mx-auto max-w-[10rem]" />
      <h2 className="mt-6 text-xl font-semibold text-slate-900">{BRAND_NAME} admin</h2>
      <p className="mt-2 text-sm text-slate-600">
        {localAvailable
          ? "Sign in with GitHub, or use local development credentials on this machine."
          : "Sign in with an approved GitHub account to manage the website."}
      </p>

      <div className="mt-6 space-y-4">
        <a
          href={GITHUB_LOGIN_PATH}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Continue with GitHub
        </a>

        {localAvailable ? (
          <>
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wide text-slate-500">
                <span className="bg-white px-2">Development only</span>
              </div>
            </div>

            {!showLocalForm ? (
              <button
                type="button"
                onClick={() => setShowLocalForm(true)}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                Local development login
              </button>
            ) : (
              <form className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4" onSubmit={submitLocalLogin}>
                <p className="text-xs text-slate-600">
                  Uses credentials from <code className="rounded bg-white px-1">.env.local</code> on this machine only.
                </p>
                <label className="block text-sm font-medium text-slate-700">
                  Username
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Password
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    autoComplete="current-password"
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                  />
                </label>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
                >
                  {busy ? "Signing in…" : "Sign in locally"}
                </button>
              </form>
            )}
          </>
        ) : null}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
