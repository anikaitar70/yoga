"use client";

import { LocaleEditorTabs, type EditorLocale } from "@/components/admin/LocaleEditorTabs";
import { MachineTranslationNote } from "@/components/admin/LocaleContentEditor";

type LocaleSectionHeaderProps = {
  title: string;
  activeLocale: EditorLocale;
  onLocaleChange: (locale: EditorLocale) => void;
  description?: string;
};

export function LocaleSectionHeader({
  title,
  activeLocale,
  onLocaleChange,
  description,
}: LocaleSectionHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <LocaleEditorTabs activeLocale={activeLocale} onChange={onLocaleChange} />
      </div>
      {description ? <p className="text-sm text-slate-600">{description}</p> : null}
      <MachineTranslationNote />
    </div>
  );
}

export function jaFieldPlaceholder(enValue: string | null | undefined): string | undefined {
  const trimmed = enValue?.trim();
  return trimmed ? `English: ${trimmed}` : undefined;
}
