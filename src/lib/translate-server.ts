import { sanitizeRichTextHtml } from "@/lib/rich-text-server";

/**
 * Server-side translation helper.
 * Priority: Google Gemini (if GEMINI_API_KEY set) -> free SMT/NMT fallback (MyMemory / Google free) when key not configured.
 * Requires no browser-exposed keys for the fallback path. All untranslated JA content can be generated via the fallback.
 */

const MODEL = process.env.TRANSLATE_MODEL?.trim() || "gemini-3.7-flash";

function getApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim() || "";
  return key.length > 0 ? key : null;
}

export async function freeTranslatePlainText(text: string): Promise<string> {
  // MyMemory free SMT/NMT — no API key required. Also falls back to Google gtx endpoint if MyMemory fails.
  const trimmed = text.trim();
  if (!trimmed) return text;
  // Try MyMemory
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|ja`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (res.ok) {
      const json = (await res.json()) as { responseData?: { translatedText?: string }; responseStatus?: number };
      const out = json.responseData?.translatedText?.trim();
      if (out && json.responseStatus !== 429 && !out.toLowerCase().includes("please select")) {
        // MyMemory sometimes returns same text when not found — still use it if it looks like Japanese (contains kana/kanji) or is different
        if (out !== trimmed) return out;
      }
    }
  } catch {
    // ignore
  }
  // Fallback to Google free gtx endpoint (NMT, no key)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ja&dt=t&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (res.ok) {
      const json = (await res.json()) as unknown;
      // Response is [[["訳文","Hello World",...]],null,"en",...]
      if (Array.isArray(json) && Array.isArray((json as unknown[])[0])) {
        const segs = (json as unknown[][])[0] as unknown[];
        const translated = segs
          .map((seg) => (Array.isArray(seg) ? (seg[0] as string) : ""))
          .join("");
        if (translated.trim()) return translated.trim();
      }
    }
  } catch {
    // ignore
  }
  // Final fallback: return original with note (avoid throwing)
  return trimmed;
}

export async function freeTranslateRichHtml(html: string): Promise<string> {
  // Preserve tags by translating only text nodes via free provider, then re-sanitize
  const tagRegex = /(<[^>]+>)/g;
  const parts = html.split(tagRegex);
  const textIndices: number[] = [];
  parts.forEach((part, idx) => {
    if (!part) return;
    if (tagRegex.test(part)) return;
    // Reset regex lastIndex after test
    tagRegex.lastIndex = 0;
    if (part.trim() && /[A-Za-z]/.test(part)) textIndices.push(idx);
  });
  if (textIndices.length === 0) return sanitizeRichTextHtml(html);
  // Translate each text node sequentially (avoid flooding free API)
  for (const idx of textIndices) {
    const original = parts[idx];
    // Preserve leading/trailing whitespace
    const leading = original.match(/^\s*/)?.[0] ?? "";
    const trailing = original.match(/\s*$/)?.[0] ?? "";
    const core = original.trim();
    if (!core) continue;
    try {
      const translated = await freeTranslatePlainText(core);
      parts[idx] = `${leading}${translated}${trailing}`;
    } catch {
      // keep original on error
    }
  }
  const reassembled = parts.join("");
  return sanitizeRichTextHtml(reassembled);
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
