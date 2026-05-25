import Link from "next/link";

const navItems = [
  { label: "Overview", href: "/admin" },
  { label: "Events", href: "/admin/events" },
  { label: "Blog posts", href: "/admin/blogs" },
  { label: "CMS", href: "/admin/content" },
  { label: "Subscribers", href: "/admin/subscribers" },
  { label: "Contacts", href: "/admin/contact" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col md:flex-row">
        <aside className="w-full border-b border-slate-200 bg-white p-4 md:w-64 md:border-r md:border-b-0 md:px-6 md:py-8">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Nirvana admin</p>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">Dashboard</h1>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
