"use client";

import { useMemo } from "react";
import {
  isBlockLevelRichParagraph,
  sanitizeRichTextHtmlDraft,
} from "@/lib/rich-text";

type PreviewRichTextProps = {
  /** Unsaved draft HTML from admin inputs — sanitized in the browser before preview. */
  html: string;
  className?: string;
  asParagraph?: boolean;
};

/** Client-side sanitized rich text for unsaved admin previews. */
export function PreviewRichText({ html, className, asParagraph = true }: PreviewRichTextProps) {
  const clean = useMemo(() => sanitizeRichTextHtmlDraft(html), [html]);
  if (!clean) return null;

  if (asParagraph && !isBlockLevelRichParagraph(clean)) {
    return <p className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
