"use client";

import { FormEvent } from "react";
import { inputClassName } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type NewsletterFormProps = {
  id?: string;
  className?: string;
  dense?: boolean;
};

export function NewsletterForm({
  id,
  className,
  dense,
}: NewsletterFormProps) {
  const emailId = id ? `${id}-email` : "newsletter-email";

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <form
      id={id}
      className={className}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Newsletter signup"
    >
      <label htmlFor={emailId} className="sr-only">
        Email address
      </label>
      <div
        className={
          dense
            ? "flex flex-col gap-2 sm:flex-row"
            : "flex flex-col gap-3 sm:flex-row sm:items-stretch"
        }
      >
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@email.com"
          className={cn(inputClassName, "min-h-11 flex-1 py-2")}
        />
        <Button type="submit" className="shrink-0 sm:min-w-[9rem]">
          Subscribe
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted">
        No spam—occasional notes on classes and gatherings.
      </p>
    </form>
  );
}
