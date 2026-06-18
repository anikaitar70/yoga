"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/admin" },
  { label: "Events", href: "/admin/events" },
  { label: "Blog posts", href: "/admin/blogs" },
  { label: "CMS", href: "/admin/content" },
  { label: "Program pages", href: "/admin/pages" },
  { label: "Subscribers", href: "/admin/subscribers" },
  { label: "Contacts", href: "/admin/contact" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Diagnostics", href: "/admin/diagnostics" },
];

function AdminSidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "block rounded-2xl px-4 py-3 text-sm font-medium transition",
              active
                ? "bg-slate-900 text-white"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AdminSidebarHeader() {
  return (
    <div className="mb-8">
      <BrandLogo context="admin" className="max-w-[10rem]" />
      <p className="mt-4 text-sm uppercase tracking-[0.24em] text-slate-500">{BRAND_NAME} admin</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Dashboard</h1>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/admin";
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  if (isDashboard) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col md:flex-row">
          <aside className="w-full border-b border-slate-200 bg-white p-4 md:w-64 md:border-r md:border-b-0 md:px-6 md:py-8">
            <AdminSidebarHeader />
            <AdminSidebarNav pathname={pathname} />
            <AdminSignOutButton />
          </aside>
          <main className="flex-1 p-6 md:p-8">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-lg text-slate-800 transition hover:bg-slate-50"
            aria-label="Open admin menu"
            aria-expanded={menuOpen}
          >
            <span aria-hidden>☰</span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {BRAND_NAME} admin
            </p>
            <p className="truncate text-sm font-semibold text-slate-900">
              {navItems.find((item) =>
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href),
              )?.label ?? "Admin"}
            </p>
          </div>
          <Link
            href="/admin"
            className="hidden rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:inline-flex"
          >
            Overview
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] p-6 md:p-8">{children}</main>

      {menuOpen ? (
        <>
          <button
            type="button"
            aria-label="Close admin menu"
            className="fixed inset-0 z-40 bg-slate-900/50"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(100vw,18rem)] flex-col border-r border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Menu</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <AdminSidebarHeader />
              <AdminSidebarNav pathname={pathname} onNavigate={() => setMenuOpen(false)} />
              <AdminSignOutButton />
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
