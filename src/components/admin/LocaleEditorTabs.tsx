"use client";

import { useState } from "react";
import { HelpIcon } from "@/components/help/HelpIcon";

export type EditorLocale = "en" | "ja";

type LocaleEditorTabsProps = {
  activeLocale: EditorLocale;
  onChange: (locale: EditorLocale) => void;
  className?: string;
};

export function LocaleEditorTabs({ activeLocale, onChange, className = "" }: LocaleEditorTabsProps) {
  return (
    <div className={`inline-flex items-center gap-1 rounded-2xl border border-slate-300 bg-white p-1 text-sm font-semibold ${className}`}>
      {(["en", "ja"] as const).map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => onChange(locale)}
          className={`rounded-xl px-4 py-2 ${
            activeLocale === locale ? "bg-slate-900 text-white" : "text-slate-700"
          }`}
        >
          {locale === "en" ? "English" : "日本語"}
        </button>
      ))}
      <HelpIcon sectionId="translation" title="Translation help" />
    </div>
  );
}

export function useEditorLocale(defaultLocale: EditorLocale = "en") {
  return useState<EditorLocale>(defaultLocale);
}
