import { cn } from "@/lib/utils";

type TestimonialTranscriptionProps = {
  text: string;
  name?: string;
  subtitle?: string;
  variant?: "handwritten" | "card";
  featured?: boolean;
  preview?: boolean;
  className?: string;
};

export function TestimonialTranscription({
  text,
  name,
  subtitle,
  variant = "handwritten",
  featured = false,
  preview = false,
  className,
}: TestimonialTranscriptionProps) {
  const isHandwritten = variant === "handwritten";

  if (!text && !name && !subtitle) {
    return null;
  }

  return (
    <figure className={cn("flex min-h-0 flex-1 flex-col", className)}>
      {text ? (
        <blockquote
          className={cn(
            preview ? "testimonial-transcription-preview" : "testimonial-fulltext-inline",
            isHandwritten
              ? "font-handwritten text-xl leading-relaxed text-foreground/90 sm:text-2xl"
              : cn(
                  "font-display leading-snug text-foreground",
                  featured ? "text-xl sm:text-2xl" : "text-lg",
                ),
          )}
        >
          {!isHandwritten ? (
            <span className="text-primary-soft" aria-hidden>
              &ldquo;
            </span>
          ) : null}
          {text}
          {!isHandwritten ? (
            <span className="text-primary-soft" aria-hidden>
              &rdquo;
            </span>
          ) : null}
        </blockquote>
      ) : null}

      {name || subtitle ? (
        <figcaption
          className={cn(
            text ? "mt-5 shrink-0 border-t border-border/50 pt-4" : "",
            isHandwritten && "border-primary/15",
          )}
        >
          {name ? (
            <p
              className={cn(
                "text-sm font-medium text-foreground",
                isHandwritten && "font-display text-base",
              )}
            >
              {name}
            </p>
          ) : null}
          {subtitle ? <p className="mt-1 text-xs text-muted">{subtitle}</p> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
