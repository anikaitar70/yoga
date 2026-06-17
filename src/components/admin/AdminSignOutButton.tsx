"use client";

export default function AdminSignOutButton() {
  return (
    <a
      href="/api/admin/logout"
      className="mt-6 block w-full rounded-2xl border border-slate-300 px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
    >
      Sign out
    </a>
  );
}
