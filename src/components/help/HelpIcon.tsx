"use client";

import Link from "next/link";

export function HelpIcon({ sectionId, title = "Help" }: { sectionId: string; title?: string }) {
  return (
    <Link
      href={`/admin/help#${encodeURIComponent(sectionId)}`}
      title={title}
      aria-label={title}
      className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    >
      ?
    </Link>
  );
}
