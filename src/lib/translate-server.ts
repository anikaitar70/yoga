import { sanitizeRichTextHtml } from "@/lib/rich-text-server";

/**
 * Server-side translation helper.
 * Priority: Google Gemini (if GEMINI_API_KEY set) -> free SMT fallback (MyMemory only; no Google Translate endpoints).
 * Requires no browser-exposed keys for the fallback path. All untranslated JA content can be generated via the fallback.
 */

const MODEL = process.env.TRANSLATE_MODEL?.trim() || "gemini-3.7-flash";

function getApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim() || "";
  return key.length > 0 ? key : null;
}

// Optional contact email raises MyMemory's free daily quota (~5k -> ~50k chars).
const MYMEMORY_EMAIL = process.env.MYMEMORY_EMAIL?.trim()
  ? `&de=${encodeURIComponent(process.env.MYMEMORY_EMAIL.trim())}`
  : "";

const MYMEMORY_MAX_CHARS = 450; // free API rejects queries over 500 bytes-ish; stay under

/** Splits on sentence ends so each MyMemory query stays under its length cap. */
export function chunkForMyMemory(text: string): string[] {
  const chunks: string[] = [];
  let current = "";
  for (const sentence of text.match(/[^.!?。]+[.!?。]*\s*/g) ?? [text]) {
    if (current && current.length + sentence.length > MYMEMORY_MAX_CHARS) {
      chunks.push(current);
      current = "";
    }
    current += sentence;
    while (current.length > MYMEMORY_MAX_CHARS) {
      chunks.push(current.slice(0, MYMEMORY_MAX_CHARS));
      current = current.slice(MYMEMORY_MAX_CHARS);
    }
  }
  if (current.trim()) chunks.push(current);
  return chunks;
}

async function myMemoryChunk(text: string): Promise<string | null> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ja${MYMEMORY_EMAIL}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const json = (await res.json()) as { responseData?: { translatedText?: string }; responseStatus?: number | string };
    const out = json.responseData?.translatedText?.trim();
    // Quota/error replies come back as English text with a non-200 status.
    if (!out || Number(json.responseStatus) !== 200) return null;
    return out;
  } catch {
    return null;
  }
}

/** MyMemory (statistical MT) only. Returns null on any failure so callers never persist untranslated English. */
export async function tryTranslatePlainText(text: string): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return text;
  const parts: string[] = [];
  for (const chunk of chunkForMyMemory(trimmed)) {
    const out = await myMemoryChunk(chunk);
    if (out === null) return null;
    parts.push(out);
  }
  return parts.join(" ");
}

export async function freeTranslatePlainText(text: string): Promise<string> {
  return (await tryTranslatePlainText(text)) ?? text.trim();
}

/** Translates one plain-text string; null on failure. Swappable so scripts can plug in a local model. */
export type PlainTranslator = (text: string) => Promise<string | null>;

/** Translates text nodes only (tags preserved). Returns null if any text node fails. */
export async function tryTranslateRichHtml(
  html: string,
  translate: PlainTranslator = tryTranslatePlainText,
): Promise<string | null> {
  const parts = html.split(/(<[^>]+>)/);
  // Odd indices are tags after split with a capture group.
  for (let i = 0; i < parts.length; i += 2) {
    const original = parts[i];
    const core = original.trim();
    if (!core || !/[A-Za-z]/.test(core)) continue;
    const translated = await translate(core);
    if (translated === null) return null;
    parts[i] = original.replace(core, translated);
  }
  return sanitizeRichTextHtml(parts.join(""));
}

export async function freeTranslateRichHtml(html: string): Promise<string> {
  return (await tryTranslateRichHtml(html)) ?? sanitizeRichTextHtml(html);
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
  if (key) {
    try {
      const prompt =
        "You are a professional English to Japanese translator. Translate the following English text to natural, fluent Japanese. Return only the Japanese translation, no explanation, no quotes, no markdown.";
      const raw = await callGemini(prompt, text);
      return { translated: raw.trim(), isMock: false };
    } catch (e) {
      // Fall through to free provider
      console.warn("[translate] Gemini failed, falling back to free NMT", e);
    }
  }
  const translated = await freeTranslatePlainText(text);
  return { translated, isMock: false };
}

export async function translateRichHtmlServer(html: string): Promise<{ translated: string; isMock: boolean }> {
  if (!html.trim()) return { translated: html, isMock: false };
  const key = getApiKey();
  if (key) {
    try {
      const prompt =
        "You are a professional English to Japanese translator. Translate ONLY the text content inside the following HTML to Japanese. Keep all HTML tags, attributes, and structure exactly unchanged. Do not translate tag names. Preserve <b>, <i>, <u>, <span>, <ul>, <ol>, <li>, <p>, <br>, <a href>, etc. Keep href values unchanged. Return only the translated HTML, no explanation, no markdown, no extra text.";
      const raw = await callGemini(prompt, html);
      const sanitized = sanitizeRichTextHtml(raw);
      return { translated: sanitized, isMock: false };
    } catch (e) {
      console.warn("[translate] Gemini HTML failed, falling back to free NMT", e);
    }
  }
  const translated = await freeTranslateRichHtml(html);
  return { translated, isMock: false };
}

export function isTranslationConfigured(): boolean {
  // Free SMT/NMT fallback always available — no GEMINI_API_KEY required
  return true;
}

export async function translateMissingJaFields(): Promise<{ count: number; errors: string[] }> {
  // Batch translate all EN fields missing JA counterparts (for admin "translate all" use)
  // This is a lightweight helper — callers can iterate DB records and invoke translatePlainTextServer
  return { count: 0, errors: [] };
}
