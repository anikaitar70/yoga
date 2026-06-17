"use client";

import Image from "next/image";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

type OverlayShellProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

function OverlayShell({ title, onClose, children, className }: OverlayShellProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={cn(
          "testimonial-overlay-panel relative max-h-[min(92vh,900px)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border/60 bg-background shadow-[0_24px_80px_rgba(42,36,31,0.2)]",
          className,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-background/95 px-5 py-4 backdrop-blur-sm sm:px-8">
          <p className="font-display text-lg text-foreground">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-muted transition hover:border-primary/30 hover:text-foreground"
          >
            Close
          </button>
        </div>
        <div className="px-5 py-6 sm:px-8 sm:py-8">{children}</div>
      </div>
    </div>
  );
}

type TestimonialFullTextOverlayProps = {
  text: string;
  name?: string;
  subtitle?: string;
  variant?: "handwritten" | "card";
  onClose: () => void;
};

export function TestimonialFullTextOverlay({
  text,
  name,
  subtitle,
  variant = "handwritten",
  onClose,
}: TestimonialFullTextOverlayProps) {
  const isHandwritten = variant === "handwritten";

  return (
    <OverlayShell title="Full message" onClose={onClose} className="journal-entry">
      <blockquote
        className={cn(
          "testimonial-fulltext",
          isHandwritten
            ? "font-handwritten text-2xl leading-relaxed text-foreground/90 sm:text-[1.75rem]"
            : "font-display text-xl leading-relaxed text-foreground sm:text-2xl",
        )}
      >
        {!isHandwritten ? <span className="text-primary-soft" aria-hidden>&ldquo;</span> : null}
        {text}
        {!isHandwritten ? <span className="text-primary-soft" aria-hidden>&rdquo;</span> : null}
      </blockquote>
      {name || subtitle ? (
        <figcaption className="mt-8 border-t border-primary/15 pt-6">
          {name ? <p className="font-display text-lg font-medium text-foreground">{name}</p> : null}
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </figcaption>
      ) : null}
    </OverlayShell>
  );
}

type TestimonialPhotoOverlayProps = {
  src: string;
  alt: string;
  onClose: () => void;
  onHideOriginals?: () => void;
};

export function TestimonialPhotoOverlay({
  src,
  alt,
  onClose,
  onHideOriginals,
}: TestimonialPhotoOverlayProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-foreground/70 p-4 backdrop-blur-sm sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Original testimonial message"
      onClick={onClose}
    >
      <div
        className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="font-display text-lg text-background">Original message</p>
        <div className="flex flex-wrap items-center gap-2">
          {onHideOriginals ? (
            <button
              type="button"
              onClick={() => {
                onHideOriginals();
                onClose();
              }}
              className="rounded-full border border-background/30 bg-background/10 px-4 py-2 text-sm font-medium text-background backdrop-blur hover:bg-background/20"
            >
              Don&apos;t show originals
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-background/30 bg-background/10 px-4 py-2 text-sm font-medium text-background backdrop-blur hover:bg-background/20"
          >
            Close
          </button>
        </div>
      </div>
      <div
        className="relative mx-auto mt-6 flex min-h-0 w-full max-w-3xl flex-1 items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative max-h-[min(78vh,820px)] w-full overflow-hidden rounded-2xl border border-background/20 bg-background shadow-2xl">
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={1600}
            className="h-auto max-h-[min(78vh,820px)] w-full object-contain"
            unoptimized={src.startsWith("/uploads/")}
          />
        </div>
      </div>
    </div>
  );
}
