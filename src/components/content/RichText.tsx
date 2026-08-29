import { sanitizeRichTextHtml } from "@/lib/rich-text-server";
import { isBlockLevelRichParagraph } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

type RichTextProps = {
  /** Pre-authored CMS HTML — sanitized again server-side before rendering. */
  html: string;
  className?: string;
  /**
   * Element to render. "auto" (default) wraps inline-only content in <p> and
   * block content in <div>; "div" and "span" force a specific element.
   */
  variant?: "auto" | "div" | "span";
};

/** Server-rendered sanitized rich text for public pages. */
export function RichText({ html, className, variant = "auto" }: RichTextProps) {
  const clean = sanitizeRichTextHtml(html);
  if (!clean) return null;

  if (variant === "span") {
    return <span className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
  }

  if (variant === "div" || isBlockLevelRichParagraph(clean)) {
    return <div className={cn("rich-text", className)} dangerouslySetInnerHTML={{ __html: clean }} />;
  }

  return <p className={cn("rich-text", className)} dangerouslySetInnerHTML={{ __html: clean }} />;
}
