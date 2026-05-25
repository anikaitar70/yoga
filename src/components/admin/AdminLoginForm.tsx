"use client";

import { useState, type FormEvent } from "react";

export default function AdminLoginForm() {
  const [secret, setSecret] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });

      if (!response.ok) {
        const result = await response.json();
        setFeedback(result?.error || "Unable to sign in.");
        return;
      }

      window.location.reload();
    } catch (error) {
      setFeedback("Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Admin access</h2>
      <p className="mt-2 text-sm text-slate-600">Enter the secret key to access the admin dashboard.</p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Secret key
          <input
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            type="password"
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
        {feedback ? <p className="text-sm text-red-600">{feedback}</p> : null}
      </form>
    </div>
  );
}
