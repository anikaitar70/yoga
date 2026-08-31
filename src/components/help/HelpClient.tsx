"use client";

import { useEffect, useMemo, useState } from "react";
import { helpSections, buildChatPromptForSection, buildChatPromptForGuide } from "@/lib/help/docs-data";
import { HelpCopyButton } from "@/components/help/HelpCopyButton";

type HelpBlock =
  | { type: "h2"; text: string; id?: string }
  | { type: "h3"; text: string; id?: string }
  | { type: "p"; text: string }
  | { type: "note"; text: string; variant?: "info" | "warning" | "tip" }
  | { type: "steps"; items: string[] }
  | { type: "bullets"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "faq"; items: { q: string; a: string }[] }
  | { type: "callout"; title: string; text: string };

function Block({ block }: { block: HelpBlock }) {
  const b = block as unknown as Record<string, unknown>;
  if (b.type === "h2") {
    const text = String(b.text ?? "");
    const id = String(b.id ?? text.toLowerCase().replace(/\W+/g, "-"));
    return <h2 id={id} className="mt-8 scroll-mt-24 text-lg font-semibold text-slate-900">{text}</h2>;
  }
  if (b.type === "h3") {
    return <h3 className="mt-6 text-sm font-semibold text-slate-800">{String(b.text ?? "")}</h3>;
  }
  if (b.type === "p") return <p className="mt-3 text-sm leading-6 text-slate-700">{String(b.text ?? "")}</p>;
  if (b.type === "note") {
    const variant = String(b.variant ?? "info");
    const styles =
      variant === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : variant === "tip"
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-sky-200 bg-sky-50 text-sky-900";
    return <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${styles}`}>{String(b.text ?? "")}</div>;
  }
  if (b.type === "steps") {
    const items = (b.items as string[] | undefined) ?? [];
    return (
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ol>
    );
  }
  if (b.type === "bullets") {
    const items = (b.items as string[] | undefined) ?? [];
    return (
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    );
  }
  if (b.type === "table") {
    const headers = (b.headers as string[] | undefined) ?? [];
    const rows = (b.rows as string[][] | undefined) ?? [];
    return (
      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-4 py-2 font-semibold text-slate-700">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row, i) => (
              <tr key={i} className="bg-white">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2 text-slate-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (b.type === "faq") {
    const items = (b.items as { q: string; a: string }[] | undefined) ?? [];
    return (
      <div className="mt-4 space-y-2">
        {items.map((f, i) => (
          <details key={i} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-800">{f.q}</summary>
            <p className="mt-2 text-sm leading-6 text-slate-600">{f.a}</p>
          </details>
        ))}
      </div>
    );
  }
  if (b.type === "callout") {
    return (
      <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50/70 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">{String(b.title ?? "")}</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">{String(b.text ?? "")}</p>
      </div>
    );
  }
  return null;
}

export function HelpClient() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>(helpSections[0]?.id ?? "");
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    helpSections.forEach((s) => (init[s.id] = true));
    return init;
  });
  const [hashActive, setHashActive] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return helpSections;
    const terms = q.split(/\s+/).filter(Boolean);
    return helpSections.filter((s) => {
      const hay = `${s.title} ${s.summary} ${s.keywords.join(" ")} ${s.body.map((b) => String((b as unknown as Record<string, unknown>).text ?? "")).join(" ")}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [query]);

  const guidePrompt = useMemo(() => buildChatPromptForGuide(), []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && helpSections.some((s) => s.id === hash)) {
      setActiveId(hash);
      setHashActive(hash);
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
    function onHash() {
      const h = window.location.hash.replace("#", "");
      if (h) setActiveId(h);
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const el = document.getElementById(activeId);
    if (el && query === "" && !hashActive) {
      // don't auto-scroll on filter
    }
  }, [activeId, query, hashActive]);

  return (
    <div className="space-y-6">
      {/* Header card with search and global copy */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Help & Documentation</h1>
        <p className="mt-2 text-sm text-slate-600">Search any topic, or pick a section on the left. Every control you see in the admin is explained here with the actual implementation.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
              🔍
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search — try: testimonial, Japanese, button, font size, spacing, preview, special event, Instagram, image"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <HelpCopyButton text={guidePrompt} label="Copy entire guide for ChatGPT" successLabel="Copied guide!" className="shrink-0 border-slate-900 bg-slate-900 text-white hover:bg-slate-800" />
        </div>
        {query ? <p className="mt-2 text-xs text-slate-500">{filtered.length} section{filtered.length === 1 ? "" : "s"} match your search.</p> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* TOC sidebar */}
        <nav className="h-fit rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6">
          <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Contents</p>
          <ul className="mt-3 space-y-1">
            {helpSections.map((s) => {
              const isFiltered = filtered.some((f) => f.id === s.id);
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveId(s.id);
                      window.history.replaceState(null, "", `#${s.id}`);
                      document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition ${activeId === s.id ? "bg-slate-900 text-white" : isFiltered ? "text-slate-800 hover:bg-slate-100" : "text-slate-400 hover:bg-slate-50"}`}
                  >
                    <span aria-hidden>{s.icon}</span>
                    <span className="truncate">{s.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-600">
            <p className="font-semibold text-slate-800">Still stuck?</p>
            <p className="mt-1">Pick a section, click “Copy this section for ChatGPT”, paste into ChatGPT, add your question under “My question:”.</p>
          </div>
        </nav>

        {/* Content */}
        <div className="space-y-6">
          {(query ? filtered : helpSections).map((section) => {
            const isActive = activeId === section.id;
            const isOpen = expanded[section.id] ?? true;
            const prompt = buildChatPromptForSection(section as never);
            return (
              <section key={section.id} id={section.id} className={`scroll-mt-6 rounded-3xl border bg-white p-6 shadow-sm ${isActive || section.id === hashActive ? "border-slate-900 ring-1 ring-slate-900/10" : "border-slate-200"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span aria-hidden className="text-lg">
                        {section.icon}
                      </span>
                      <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{section.summary}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <HelpCopyButton text={prompt} label="Copy this section for ChatGPT" className="border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100" />
                    <button
                      type="button"
                      onClick={() => setExpanded((prev) => ({ ...prev, [section.id]: !isOpen }))}
                      className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      aria-expanded={isOpen}
                    >
                      {isOpen ? "Collapse" : "Expand"}
                    </button>
                  </div>
                </div>
                {isOpen ? (
                  <>
                    <div className="mt-2">
                      {section.body.map((block, i) => (
                        <Block key={i} block={block as unknown as HelpBlock} />
                      ))}
                    </div>
                    <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
                      <p className="text-xs font-semibold text-slate-600">Still stuck on {section.title}?</p>
                      <HelpCopyButton text={`${prompt}\n\nContext for this report:\n- Current admin page: /admin/help#${section.id}\n- Section: ${section.title}\n- What I expected vs what happened: [describe]\n- Screenshot / URL if relevant: [paste]\n\nMy question:\n[TYPE YOUR QUESTION HERE]`} label="Copy problem details for ChatGPT" className="border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-100" />
                      <span className="text-xs text-slate-500">Paste into ChatGPT and add your question after “My question:”. Include the context lines.</span>
                    </div>
                  </>
                ) : null}
              </section>
            );
          })}
          {query && filtered.length === 0 ? <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-amber-900">No sections match “{query}”. Try fewer words or a different term.</p> : null}
        </div>
      </div>
    </div>
  );
}
