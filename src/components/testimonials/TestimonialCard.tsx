"use client";

import { useState } from "react";
import type { Testimonial } from "@/content/types";
import { Card } from "@/components/ui/Card";
import { TestimonialImage } from "@/components/testimonials/TestimonialImage";
import { TestimonialTranscription } from "@/components/testimonials/TestimonialTranscription";
import { TestimonialFullTextOverlay } from "@/components/testimonials/TestimonialOverlays";
import {
  testimonialAttribution,
  testimonialDisplayQuote,
  testimonialHasImage,
  testimonialIsRenderable,
} from "@/lib/testimonial-display";
import { cn } from "@/lib/utils";

const READ_FULL_MIN_CHARS = 120;

export type TestimonialCardProps = {
  testimonial: Testimonial;
  className?: string;
  variant?: "default" | "featured";
};

export function TestimonialCard({ testimonial, className, variant = "default" }: TestimonialCardProps) {
  const [fullTextOpen, setFullTextOpen] = useState(false);

  if (!testimonialIsRenderable(testimonial)) {
    return null;
  }

  const quote = testimonialDisplayQuote(testimonial);
  const hasImage = testimonialHasImage(testimonial);
  const hasQuote = Boolean(quote);
  const isHandwritten = testimonial.displayStyle !== "card";
  const isFeatured = variant === "featured";
  const { name, subtitle } = testimonialAttribution(testimonial);
  const showReadFull = hasQuote && (isHandwritten || quote.length >= READ_FULL_MIN_CHARS);

  return (
    <>
      <Card
        variant={isHandwritten ? "flat" : isFeatured ? "elevated" : "default"}
        className={cn(
          "testimonial-card flex h-full flex-col p-0 text-left transition-all duration-500",
          "hover:shadow-[0_12px_36px_rgba(42,36,31,0.08)]",
          isFeatured && "testimonial-card--featured",
          isHandwritten && "journal-entry border-primary/15 bg-[#faf6ef]",
          isFeatured && "min-w-[var(--card-w,min(88vw,400px))]",
          !isFeatured && "min-w-[var(--card-w,min(85vw,300px))]",
          className,
        )}
      >
        {hasImage && !isHandwritten ? (
          <div
            className={cn(
              "relative w-full overflow-hidden",
              isFeatured ? "aspect-[5/4]" : "aspect-[4/3]",
            )}
          >
            <TestimonialImage
              src={testimonial.imageUrl!}
              alt={testimonial.imageAlt || name || "Testimonial"}
              className="h-full rounded-none border-0 border-b border-border/40"
            />
          </div>
        ) : null}

        <div className={cn("flex min-h-0 flex-1 flex-col", isFeatured ? "p-7 sm:p-8" : "p-6 sm:p-7")}>
          {hasQuote ? (
            <TestimonialTranscription
              text={quote}
              name={name}
              subtitle={subtitle}
              variant={isHandwritten ? "handwritten" : "card"}
              featured={isFeatured}
              preview={showReadFull}
            />
          ) : (
            <TestimonialTranscription
              text=""
              name={name}
              subtitle={subtitle}
              variant={isHandwritten ? "handwritten" : "card"}
              featured={isFeatured}
            />
          )}

          {showReadFull ? (
            <div className="mt-5 border-t border-primary/10 pt-4">
              <button
                type="button"
                onClick={() => setFullTextOpen(true)}
                className="rounded-full border border-primary/25 bg-primary-soft/30 px-4 py-2 text-xs font-medium text-primary-muted transition hover:border-primary/40 hover:text-primary"
              >
                Read full message
              </button>
            </div>
          ) : null}
        </div>
      </Card>

      {fullTextOpen && hasQuote ? (
        <TestimonialFullTextOverlay
          text={quote}
          name={name}
          subtitle={subtitle}
          variant={isHandwritten ? "handwritten" : "card"}
          onClose={() => setFullTextOpen(false)}
        />
      ) : null}
    </>
  );
}
