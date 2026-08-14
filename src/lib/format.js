import { getIntlLocale, normalizeLanguage, translate } from "@/lib/i18n";

export function formatINR(amount, { signed = false } = {}) {
  const value = Number(amount) || 0;
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(abs);

  if (!signed) return formatted;
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

export function formatINRPlain(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function greetingForNow(date = new Date(), language = "en") {
  const hour = date.getHours();
  if (hour < 12) return translate(language, "home.greetingMorning");
  if (hour < 17) return translate(language, "home.greetingAfternoon");
  return translate(language, "home.greetingEvening");
}

export function formatEntryDate(iso, language = "en") {
  const d = new Date(iso);
  return d.toLocaleDateString(getIntlLocale(normalizeLanguage(language)), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatEntryTime(iso, language = "en") {
  const d = new Date(iso);
  return d.toLocaleTimeString(getIntlLocale(normalizeLanguage(language)), {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatEntryDateTime(iso, language = "en") {
  return `${formatEntryDate(iso, language)} · ${formatEntryTime(iso, language)}`;
}

export function entryTypeLabel(type, language = "en") {
  if (type === "invoice") return translate(language, "entry.bill");
  if (type === "gave") return translate(language, "entry.youGave");
  return translate(language, "entry.youGot");
}

export function formatBillNumber(entry) {
  const d = new Date(entry?.date || Date.now());
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const suffix = String(entry?.id || "XXXX")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-4)
    .toUpperCase()
    .padStart(4, "X");
  const prefix = entry?.type === "invoice" ? "BL" : "RC";
  return `${prefix}-${yy}${mm}${dd}-${suffix}`;
}

export function formatDateHeader(iso, language = "en") {
  const d = new Date(iso);
  return d
    .toLocaleDateString(getIntlLocale(normalizeLanguage(language)), {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

export function toDateInputValue(iso = new Date().toISOString()) {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}
