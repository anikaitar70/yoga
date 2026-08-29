/**
 * Minimal rich-text preserving "machine translation" helper.
 * Preserves allowed HTML tags and translates visible text nodes by appending a JA marker.
 * For production, replace `translateTextNode` with a real translation API that preserves HTML structure.
 * The helper never translates tag names/attributes, only text content.
 */



function translateTextNode(text: string): string {
  if (!text.trim()) return text;
  // Placeholder machine translation: keep original and append marker.
  // Replace this with real translation (e.g., call external API) while preserving the same text-node walking.
  // We keep it simple to avoid breaking formatting: suffix with "（日本語訳）" or wrap.
  // For demo, we return text + " [JA]";
  return `${text} [JA]`;
}

function walkAndTranslate(doc: Document, node: Node): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.nodeValue ?? "";
    if (text.trim()) {
      node.nodeValue = translateTextNode(text);
    }
    return;
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    for (const child of Array.from(el.childNodes)) {
      walkAndTranslate(doc, child);
    }
  } else {
    for (const child of Array.from(node.childNodes)) {
      walkAndTranslate(doc, child);
    }
  }
}

export function autoTranslateRichHtml(html: string): string {
  if (!html || !html.trim()) return "";
  if (typeof window === "undefined") {
    return html.replace(/>([^<]+)</g, (_m, text: string) => `>${translateTextNode(text)}<`);
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
    const container = doc.body.firstChild as Element;
    if (!container) return html;
    walkAndTranslate(doc, container);
    return container.innerHTML;
  } catch {
    return html;
  }
}

export function autoTranslatePlainText(text: string): string {
  if (!text.trim()) return text;
  return `${text} [JA]`;
}

/** Client-side helper that calls the server translation API (admin-only). */
export async function translateHtmlViaApi(html: string): Promise<string> {
  if (!html.trim()) return html;
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ html }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Translate failed ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as { translatedHtml?: string; translatedText?: string };
  return (json.translatedHtml ?? json.translatedText ?? html) as string;
}

export async function translateTextViaApi(text: string): Promise<string> {
  if (!text.trim()) return text;
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ plainText: text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Translate failed ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as { translatedText?: string; translatedHtml?: string };
  return (json.translatedText ?? json.translatedHtml ?? text) as string;
}
