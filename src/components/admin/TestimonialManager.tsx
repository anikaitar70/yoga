"use client";

import { useMemo, useState } from "react";
import type { AdminTestimonial } from "@/lib/admin-types";
import { adminJsonRequest } from "@/lib/admin-fetch";
import { OCRReviewPanel } from "@/components/testimonials/OCRReviewPanel";

const EMPTY_FORM: AdminTestimonial = {
  id: "",
  name: "",
  role: "",
  quote: "",
  city: "",
  country: "",
  imageUrl: null,
  imageAlt: null,
  extractedText: null,
  sourceType: "text",
  displayStyle: "handwritten",
  ocrConfidence: null,
  status: "pending",
  featured: false,
  sortOrder: 0,
};

type TestimonialManagerProps = {
  initialTestimonials: AdminTestimonial[];
  onMessage: (message: string | null) => void;
};

export function TestimonialManager({ initialTestimonials, onMessage }: TestimonialManagerProps) {
  const [testimonialList, setTestimonialList] = useState(initialTestimonials);
  const [testimonialForm, setTestimonialForm] = useState<AdminTestimonial>(EMPTY_FORM);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sortedList = useMemo(
    () =>
      [...testimonialList].sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      }),
    [testimonialList],
  );

  const sendJson = async <T,>(url: string, method: string, data?: unknown) =>
    adminJsonRequest<T>(url, method, data);

  const runTestimonialOcr = async (imageUrl: string) => {
    setOcrBusy(true);
    setOcrError(null);
    onMessage("Reading text from image…");

    try {
      const result = await sendJson<{
        quote: string;
        name: string;
        role: string;
        city: string;
        country: string;
        extractedText: string;
        confidence: number;
        ocrFailed?: boolean;
        error?: string;
      }>("/api/cms/testimonials/ocr", "POST", { imageUrl });

      if (result.ocrFailed || result.error) {
        setOcrError(result.error || "OCR could not read this image. Enter the quote manually.");
        setTestimonialForm((prev) => ({
          ...prev,
          sourceType: "image",
        }));
        onMessage("Image uploaded. OCR did not complete — you can still save and edit the text below.");
        return;
      }

      setTestimonialForm((prev) => ({
        ...prev,
        quote: result.quote || prev.quote,
        name: result.name || prev.name,
        role: result.role || prev.role,
        city: result.city || prev.city,
        country: result.country || prev.country,
        extractedText: result.extractedText,
        ocrConfidence: result.confidence,
        sourceType: "ocr",
        displayStyle: prev.displayStyle ?? "handwritten",
      }));
      onMessage("OCR complete — review and edit the extracted text before saving.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "OCR failed.";
      setOcrError(`${message} You can still save the testimonial and enter text manually.`);
      setTestimonialForm((prev) => ({ ...prev, sourceType: "image" }));
      onMessage("Image uploaded. OCR failed — enter the quote manually and save.");
    } finally {
      setOcrBusy(false);
    }
  };

  const handleTestimonialImage = async (imageUrl: string) => {
    setTestimonialForm((prev) => ({
      ...prev,
      imageUrl,
      imageAlt: prev.imageAlt || prev.name || "Testimonial",
      sourceType: "image",
    }));
    if (imageUrl) {
      await runTestimonialOcr(imageUrl);
    }
  };

  const handleTestimonialSave = async () => {
    const hasQuote = Boolean(testimonialForm.quote?.trim());
    const hasImage = Boolean(testimonialForm.imageUrl?.trim());
    if (!hasQuote && !hasImage) {
      onMessage("Add a quote or upload an image before saving.");
      return;
    }

    const payload = {
      name: testimonialForm.name?.trim() || undefined,
      role: testimonialForm.role?.trim() || undefined,
      quote: testimonialForm.quote?.trim() || undefined,
      city: testimonialForm.city?.trim() || null,
      country: testimonialForm.country?.trim() || null,
      imageUrl: testimonialForm.imageUrl?.trim() || null,
      imageAlt: testimonialForm.imageAlt?.trim() || null,
      extractedText: testimonialForm.extractedText?.trim() || null,
      sourceType: testimonialForm.sourceType,
      displayStyle: testimonialForm.displayStyle,
      ocrConfidence: testimonialForm.ocrConfidence,
      status: testimonialForm.status,
      featured: testimonialForm.featured,
      sortOrder: testimonialForm.sortOrder,
    };

    try {
      setSaving(true);
      onMessage(null);
      const result = testimonialForm.id
        ? await sendJson<AdminTestimonial>(`/api/cms/testimonials/${testimonialForm.id}`, "PUT", payload)
        : await sendJson<AdminTestimonial>("/api/cms/testimonials", "POST", payload);

      const updatedList = testimonialForm.id
        ? testimonialList.map((item) => (item.id === result.id ? result : item))
        : [result, ...testimonialList];

      setTestimonialList(updatedList);
      setTestimonialForm(EMPTY_FORM);
      onMessage("Testimonial saved.");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!testimonialForm.id) return;
    if (!window.confirm("Delete this testimonial?")) return;

    try {
      setSaving(true);
      await sendJson(`/api/cms/testimonials/${testimonialForm.id}`, "DELETE");
      setTestimonialList((list) => list.filter((item) => item.id !== testimonialForm.id));
      setTestimonialForm(EMPTY_FORM);
      onMessage("Testimonial deleted.");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setSaving(false);
    }
  };

  const moveTestimonial = async (id: string, direction: "up" | "down") => {
    const index = sortedList.findIndex((item) => item.id === id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || swapIndex < 0 || swapIndex >= sortedList.length) return;

    const reordered = [...sortedList];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(swapIndex, 0, moved);

    try {
      setSaving(true);
      const updates = await Promise.all(
        reordered.map((item, orderIndex) =>
          sendJson<AdminTestimonial>(`/api/cms/testimonials/${item.id}`, "PUT", {
            sortOrder: orderIndex,
          }),
        ),
      );

      setTestimonialList((list) =>
        list.map((item) => updates.find((updated) => updated.id === item.id) ?? item),
      );
      onMessage("Order updated.");
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "Reorder failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Testimonials</h2>
        <p className="mt-1 text-sm text-slate-600">
          One library for homepage, Yoga, Healing, and Just Art Affaire. Tap to edit; use arrows to reorder.
        </p>
        <div className="mt-4 space-y-2">
          {sortedList.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center gap-2 rounded-2xl border px-3 py-2 ${
                testimonialForm.id === item.id
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  disabled={saving || index === 0}
                  onClick={() => void moveTestimonial(item.id, "up")}
                  className="rounded border border-slate-200 px-2 text-xs text-slate-600 hover:bg-white disabled:opacity-40"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={saving || index === sortedList.length - 1}
                  onClick={() => void moveTestimonial(item.id, "down")}
                  className="rounded border border-slate-200 px-2 text-xs text-slate-600 hover:bg-white disabled:opacity-40"
                  aria-label="Move down"
                >
                  ↓
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTestimonialForm(item);
                  onMessage(null);
                }}
                className="min-w-0 flex-1 text-left text-sm text-slate-700"
              >
                <strong>{item.name || "Untitled"}</strong>
                {item.role ? ` · ${item.role}` : ""}
                {item.featured ? (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
                    Featured
                  </span>
                ) : null}
                <span className="ml-2 text-xs capitalize text-slate-500">{item.status}</span>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setTestimonialForm(EMPTY_FORM);
            onMessage(null);
          }}
          className="mt-4 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          + New testimonial
        </button>
      </div>

      <OCRReviewPanel
        form={testimonialForm}
        ocrBusy={ocrBusy}
        ocrError={ocrError}
        saving={saving}
        onChange={setTestimonialForm}
        onImageUpload={handleTestimonialImage}
        onRerunOcr={() => (testimonialForm.imageUrl ? runTestimonialOcr(testimonialForm.imageUrl) : undefined)}
        onSave={handleTestimonialSave}
        onClear={() => setTestimonialForm(EMPTY_FORM)}
        onDelete={testimonialForm.id ? handleDelete : undefined}
      />
    </div>
  );
}
