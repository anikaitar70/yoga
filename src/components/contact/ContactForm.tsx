"use client";

import { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";

export function ContactForm() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-lg space-y-6"
      noValidate
      aria-label="Contact form"
    >
      <FormField
        id="contact-name"
        label="Name"
        name="name"
        autoComplete="name"
        placeholder="Your name"
      />
      <FormField
        id="contact-email"
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@email.com"
      />
      <FormField
        id="contact-message"
        label="Message"
        name="message"
        multiline
        placeholder="How can we help?"
      />
      <Button type="submit" className="w-full sm:w-auto">
        Send message
      </Button>
      <p className="text-xs text-muted">
        This form is a preview—submission is not connected yet.
      </p>
    </form>
  );
}
