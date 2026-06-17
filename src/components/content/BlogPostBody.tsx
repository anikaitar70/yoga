import { contentToParagraphs } from "@/lib/page-section-types";
import { Prose } from "@/components/ui/Prose";

type BlogPostBodyProps = {
  content: string;
  className?: string;
};

/** Renders CMS blog body — paragraphs separated by blank lines. */
export function BlogPostBody({ content, className }: BlogPostBodyProps) {
  const paragraphs = contentToParagraphs(content);

  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <Prose className={className}>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </Prose>
  );
}
