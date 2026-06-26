"use client";

import { FormEvent, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { inputClassName } from "@/lib/constants";
import { JA_UI } from "@/lib/i18n/ui";

const CONTACT_METHODS = [
  { value: "WHATSAPP", label: "WhatsApp", labelJa: "WhatsApp" },
  { value: "CALL", label: "Phone call", labelJa: "電話" },
  { value: "SMS", label: "SMS", labelJa: "SMS" },
  { value: "EMAIL", label: "Email", labelJa: "メール" },
  { value: "LINE", label: "LINE", labelJa: "LINE" },
  { value: "TELEGRAM", label: "Telegram", labelJa: "Telegram" },
  { value: "OTHER", label: "Other", labelJa: "その他" },
] as const;

type ProgramInquiryFormProps = {
  defaultSubject?: string;
};

export function ProgramInquiryForm({ defaultSubject = "Studio inquiry" }: ProgramInquiryFormProps) {
  const { locale } = useLocale();
  const isJa = locale === "ja";
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const labels = isJa
    ? {
        name: JA_UI.formName,
        email: JA_UI.formEmail,
        phone: JA_UI.formPhone,
        contactMethod: JA_UI.formContactMethod,
        message: JA_UI.formMessage,
        submit: JA_UI.formSubmit,
        sending: "送信中…",
        success: JA_UI.formSuccess,
        error: JA_UI.formError,
        newsletter: "ニュースレターの更新を受け取る",
        placeholder: "ご質問やご要望をお聞かせください…",
        aria: "お問い合わせフォーム",
      }
    : {
        name: "Name",
        email: "Email",
        phone: "Phone number",
        contactMethod: "Preferred contact method",
        message: "Message",
        submit: "Send inquiry",
        sending: "Sending…",
        success: "Thank you — we received your message and will reply soon.",
        error: "Unable to send message. Please try again.",
        newsletter: "Receive newsletter updates from us",
        placeholder: "Tell us how we can help…",
        aria: "Inquiry form",
      };

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
        setFeedback(data.details?.join(" ") || data.error || labels.error);
        return;
      }

      setSuccess(true);
      event.currentTarget.reset();
    } catch {
      setFeedback(labels.error);
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <p className="rounded-sm border border-border bg-card px-4 py-3 text-sm text-foreground">
        {labels.success}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate aria-label={labels.aria}>
      <FormField id="inquiry-name" label={labels.name} name="name" autoComplete="name" />
      <FormField id="inquiry-email" label={labels.email} name="email" type="email" autoComplete="email" />
      <FormField
        id="inquiry-phone"
        label={labels.phone}
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="+91 98xxxxxxx"
      />
      <input type="hidden" name="subject" value={defaultSubject} />
      <label className="block text-sm font-medium text-foreground" htmlFor="inquiry-contact-method">
        {labels.contactMethod}
        <select
          id="inquiry-contact-method"
          name="preferredContactMethod"
          className={`mt-2 ${inputClassName}`}
          defaultValue="EMAIL"
        >
          {CONTACT_METHODS.map((method) => (
            <option key={method.value} value={method.value}>
              {isJa ? method.labelJa : method.label}
            </option>
          ))}
        </select>
      </label>
      <FormField
        id="inquiry-message"
        label={labels.message}
        name="message"
        multiline
        placeholder={labels.placeholder}
      />
      <label className="flex items-start gap-3 text-sm text-foreground" htmlFor="inquiry-newsletter">
        <input
          id="inquiry-newsletter"
          name="subscribeToNewsletter"
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-border"
        />
        <span>{labels.newsletter}</span>
      </label>
      {feedback ? <p className="text-sm text-red-600">{feedback}</p> : null}
      <Button type="submit" disabled={busy} className="w-full sm:w-auto">
        {busy ? labels.sending : labels.submit}
      </Button>
    </form>
  );
}
