/** Heuristic parsing of OCR text from testimonial screenshots. */

export type ParsedTestimonialOcr = {
  quote: string;
  name: string;
  role: string;
  city: string;
  country: string;
};

const LOCATION_PATTERNS = [
  /(?:from|in|at)\s+([A-Z][a-zA-Z\s,]+(?:Japan|India|USA|UK|Australia|Canada)[a-zA-Z\s,]*)/i,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*(Japan|India|USA|UK|Australia|Canada)/,
];

function cleanLine(line: string) {
  return line.replace(/\s+/g, " ").trim();
}

function isLikelyName(line: string) {
  const trimmed = cleanLine(line);
  if (trimmed.length < 2 || trimmed.length > 48) return false;
  if (/^\d|whatsapp|message|thank|namaste|🙏|❤/i.test(trimmed)) return false;
  const words = trimmed.split(/\s+/);
  if (words.length > 5) return false;
  return /^[A-Z][a-zA-Z\-']+(\s+[A-Z][a-zA-Z\-'.]+)*$/.test(trimmed);
}

export function parseTestimonialOcrText(raw: string): ParsedTestimonialOcr {
  const lines = raw
    .split(/\r?\n/)
    .map(cleanLine)
    .filter((line) => line.length > 1);

  let name = "";
  let role = "";
  let city = "";
  let country = "";
  const quoteLines: string[] = [];

  for (const line of lines) {
    if (!name && isLikelyName(line)) {
      name = line;
      continue;
    }

    let matchedLocation = false;
    for (const pattern of LOCATION_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        if (match[2]) {
          city = match[1]?.trim() ?? "";
          country = match[2]?.trim() ?? "";
        } else {
          const parts = match[1]?.split(",").map((p) => p.trim()) ?? [];
          city = parts[0] ?? "";
          country = parts[parts.length - 1] ?? "";
        }
        matchedLocation = true;
        break;
      }
    }
    if (matchedLocation) continue;

    if (/^(yoga|student|participant|teacher|artist|healer)/i.test(line) && line.length < 60) {
      role = line;
      continue;
    }

    quoteLines.push(line);
  }

  const quote = quoteLines.join(" ").replace(/\s{2,}/g, " ").trim();

  if (!role && country) {
    role = country;
  }

  return { quote, name, role, city, country };
}
