import { cn } from "@/lib/utils";
import { isBlockLevelRichParagraph } from "@/lib/rich-text";

type RichHtmlProps = {
  /** Pre-sanitized HTML (sanitized server-side before reaching this component). */
  html: string;
  className?: string;
  /** Element used for inline-only content; block content always renders as <div>. */
  as?: "p" | "div";
};

/**
 * Renders pre-sanitized rich-text HTML inside client or server components.
 * NEVER pass raw user input — callers must sanitize first
 * (server paths: src/lib/rich-text-server.ts, admin drafts: PreviewRichText).
 */
export function RichHtml({ html, className, as = "div" }: RichHtmlProps) {
  if (!html) return null;

  // Plain text with blank lines becomes multiple <p> blocks after sanitization at the boundary,
  // so treat any multi-paragraph HTML as block.
  const isBlock = isBlockLevelRichParagraph(html) || html.includes("</p><p>");
  const Tag = !isBlock && as === "p" ? "p" : "div";
  return <Tag className={cn("rich-text", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
