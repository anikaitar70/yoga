"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { inputClassName } from "@/lib/constants";

const CONTACT_METHODS = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "CALL", label: "Phone call" },
  { value: "SMS", label: "SMS" },
  { value: "EMAIL", label: "Email" },
  { value: "LINE", label: "LINE" },
  { value: "TELEGRAM", label: "Telegram" },
  { value: "OTHER", label: "Other" },
] as const;

type ProgramInquiryFormProps = {
  defaultSubject?: string;
};

export function ProgramInquiryForm({ defaultSubject = "Studio inquiry" }: ProgramInquiryFormProps) {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? "") || undefined,
      subject: String(formData.get("subject") ?? defaultSubject),
      message: String(formData.get("message") ?? ""),
      preferredContactMethod: String(formData.get("preferredContactMethod") ?? "") || undefined,
      subscribeToNewsletter: formData.get("subscribeToNewsletter") === "on",
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { error?: string; details?: string[] };

      if (!response.ok) {
        setFeedback(data.details?.join(" ") || data.error || "Unable to send message.");
        return;
      }

      setSuccess(true);
      event.currentTarget.reset();
    } catch {
      setFeedback("Unable to send message. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <p className="rounded-sm border border-border bg-card px-4 py-3 text-sm text-foreground">
        Thank you — we received your message and will reply soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate aria-label="Inquiry form">
      <FormField id="inquiry-name" label="Name" name="name" autoComplete="name" />
      <FormField id="inquiry-email" label="Email" name="email" type="email" autoComplete="email" />
      <FormField
        id="inquiry-phone"
        label="Phone number"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="+91 98xxxxxxx"
      />
      <input type="hidden" name="subject" value={defaultSubject} />
      <label className="block text-sm font-medium text-foreground" htmlFor="inquiry-contact-method">
        Preferred contact method
        <select
          id="inquiry-contact-method"
          name="preferredContactMethod"
          className={`mt-2 ${inputClassName}`}
          defaultValue="EMAIL"
        >
          {CONTACT_METHODS.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>
      </label>
      <FormField
        id="inquiry-message"
        label="Message"
        name="message"
        multiline
        placeholder="Tell us how we can help…"
      />
      <label className="flex items-start gap-3 text-sm text-foreground" htmlFor="inquiry-newsletter">
        <input
          id="inquiry-newsletter"
          name="subscribeToNewsletter"
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-border"
        />
        <span>Receive newsletter updates from us</span>
      </label>
      {feedback ? <p className="text-sm text-red-600">{feedback}</p> : null}
      <Button type="submit" disabled={busy} className="w-full sm:w-auto">
        {busy ? "Sending…" : "Send inquiry"}
      </Button>
    </form>
  );
}
