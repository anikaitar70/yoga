import { sanitizeRichTextHtml } from "@/lib/rich-text-server";

/**
 * Server-side translation helper using Google Gemini.
 * Requires GEMINI_API_KEY (server-side .env) and TRANSLATE_MODEL (default gemini-3.7-flash).
 * API key is never exposed to the browser.
 * If GEMINI_API_KEY is missing or Gemini is unavailable/invalid, callers receive a clear error.
 */

const MODEL = process.env.TRANSLATE_MODEL?.trim() || "gemini-3.7-flash";

function getApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim() || "";
  return key.length > 0 ? key : null;
}

function getGeminiUrl(model: string, key: string): string {
  // Use v1beta generateContent
  const encodedModel = encodeURIComponent(model);
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodedModel}:generateContent?key=${encodeURIComponent(key)}`;
}

async function callGemini(prompt: string, content: string): Promise<string> {
  const key = getApiKey();
  if (!key) {
    throw new Error("GEMINI_API_KEY not configured. Set GEMINI_API_KEY in server .env");
  }

  const url = getGeminiUrl(MODEL, key);
  const body = {
    contents: [
      {
        parts: [
          {
            text: `${prompt}\n\n${content}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // Try to parse Gemini error JSON for clearer message
    let details = text.slice(0, 800);
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string } };
      if (parsed.error?.message) details = parsed.error.message;
    } catch {
      // keep raw
    }
    throw new Error(`Gemini API error ${res.status}: ${details}`);
  }

  const json = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
    promptFeedback?: unknown;
  };

  const out = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  if (!out) {
    throw new Error("Empty translation response from Gemini");
  }
  return out;
}

export async function translatePlainTextServer(text: string): Promise<{ translated: string; isMock: boolean }> {
  if (!text.trim()) return { translated: text, isMock: false };
  const key = getApiKey();
  if (!key) {
    throw new Error("GEMINI_API_KEY not configured. Set GEMINI_API_KEY in server .env to enable translation");
  }
  const prompt =
    "You are a professional English to Japanese translator. Translate the following English text to natural, fluent Japanese. Return only the Japanese translation, no explanation, no quotes, no markdown.";
  const raw = await callGemini(prompt, text);
  return { translated: raw.trim(), isMock: false };
}

export async function translateRichHtmlServer(html: string): Promise<{ translated: string; isMock: boolean }> {
  if (!html.trim()) return { translated: html, isMock: false };
  const key = getApiKey();
  if (!key) {
    throw new Error("GEMINI_API_KEY not configured. Set GEMINI_API_KEY in server .env to enable translation");
  }
  const prompt =
    "You are a professional English to Japanese translator. Translate ONLY the text content inside the following HTML to Japanese. Keep all HTML tags, attributes, and structure exactly unchanged. Do not translate tag names. Preserve <b>, <i>, <u>, <span>, <ul>, <ol>, <li>, <p>, <br>, <a href>, etc. Keep href values unchanged. Return only the translated HTML, no explanation, no markdown, no extra text.";
  const raw = await callGemini(prompt, html);
  const sanitized = sanitizeRichTextHtml(raw);
  return { translated: sanitized, isMock: false };
}

export function isTranslationConfigured(): boolean {
  return Boolean(getApiKey());
}
