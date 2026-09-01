"use client";

import { useMemo } from "react";
import { isBlockLevelRichParagraph } from "@/lib/rich-text";
import { sanitizeRichTextHtml } from "@/lib/rich-text-server";

type PreviewRichTextProps = {
  /** Unsaved draft HTML from admin inputs — sanitized in the browser before preview. */
  html: string;
  className?: string;
  asParagraph?: boolean;
};

/** Sanitized rich text for admin previews — uses isomorphic sanitizer so server/client match. */
export function PreviewRichText({ html, className, asParagraph = true }: PreviewRichTextProps) {
  const clean = useMemo(() => sanitizeRichTextHtml(html), [html]);
  if (!clean) return null;

  if (asParagraph && !isBlockLevelRichParagraph(clean)) {
    return <p className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
  }

  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
