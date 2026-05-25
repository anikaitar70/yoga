const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const eventDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDate(dateIso: string): string {
  return dateFormatter.format(new Date(dateIso));
}

export function formatEventRange(dateIso: string, endIso?: string): string {
  const start = new Date(dateIso);
  if (!endIso) return eventDateFormatter.format(start);

  const end = new Date(endIso);
  const dayPart = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(start);
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${dayPart} · ${timeFormatter.format(start)} – ${timeFormatter.format(end)}`;
}

export function formatPhoneHref(phone: string): string {
  return `tel:${phone.replace(/\D/g, "")}`;
}
