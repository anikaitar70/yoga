"use client";

import { FormEvent } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { inputClassName } from "@/lib/constants";
import { JA_UI } from "@/lib/i18n/ui";
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
  const { locale } = useLocale();
  const isJa = locale === "ja";
  const emailId = id ? `${id}-email` : "newsletter-email";
  const emailLabel = isJa ? JA_UI.newsletterPlaceholder : "Email address";
  const submitLabel = isJa ? JA_UI.newsletterSubmit : "Subscribe";
  const disclaimer = isJa
    ? "スパムは送りません — クラスや集いのお知らせを時々お届けします。"
    : "No spam—occasional notes on classes and gatherings.";

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <form
      id={id}
      className={className}
      onSubmit={handleSubmit}
      noValidate
      aria-label={isJa ? "ニュースレター登録" : "Newsletter signup"}
    >
      <label htmlFor={emailId} className="sr-only">
        {emailLabel}
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
          placeholder={isJa ? "メールアドレス" : "you@email.com"}
          className={cn(inputClassName, "min-h-11 flex-1 py-2")}
        />
        <Button type="submit" className="shrink-0 sm:min-w-[9rem]">
          {submitLabel}
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted">{disclaimer}</p>
    </form>
  );
}
