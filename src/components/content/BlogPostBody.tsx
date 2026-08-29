import { contentToParagraphs } from "@/lib/page-section-types";
import { Prose } from "@/components/ui/Prose";
import { RichText } from "@/components/content/RichText";

type BlogPostBodyProps = {
  content: string;
  className?: string;
};

/** Renders CMS blog body — paragraphs separated by blank lines. Supports inline rich-text HTML. */
export function BlogPostBody({ content, className }: BlogPostBodyProps) {
  const paragraphs = contentToParagraphs(content);

  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <Prose className={className}>
      {paragraphs.map((paragraph, index) => (
        <RichText key={index} html={paragraph} />
      ))}
    </Prose>
  );
}
