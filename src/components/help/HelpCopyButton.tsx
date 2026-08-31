"use client";

import { useState } from "react";

export function HelpCopyButton({ text, label = "Copy", successLabel = "Copied!", className = "" }: { text: string; label?: string; successLabel?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: prompt
      window.prompt("Copy this text:", text);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${copied ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"} ${className}`}
      aria-label={label}
    >
      <span aria-hidden>{copied ? "✓" : "⎘"}</span>
      {copied ? successLabel : label}
    </button>
  );
}
