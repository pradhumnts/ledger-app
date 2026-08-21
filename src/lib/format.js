import { getIntlLocale, normalizeLanguage, translate } from "@/lib/i18n";
import { paiseToRupees, rupeesToPaise } from "@/lib/supabase/money";

export function formatINR(amount, { signed = false } = {}) {
  const value = paiseToRupees(rupeesToPaise(amount));
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(abs);

  if (!signed) return formatted;
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

export function formatINRPlain(amount) {
  const value = paiseToRupees(rupeesToPaise(amount));
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
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

function isUtcMidnight(date) {
  return (
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0
  );
}

/** Date-only values were stored as UTC midnight (5:30 AM IST). Restore local time. */
export function resolveEntryWhen(entry) {
  const dateRaw = entry?.date;
  const createdRaw = entry?.createdAt;
  if (!dateRaw) return createdRaw || new Date().toISOString();
  const date = new Date(dateRaw);
  if (Number.isNaN(date.getTime())) return createdRaw || dateRaw;
  const created = createdRaw ? new Date(createdRaw) : null;
  if (created && !Number.isNaN(created.getTime()) && isUtcMidnight(date)) {
    return new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      created.getHours(),
      created.getMinutes(),
      created.getSeconds(),
      created.getMilliseconds()
    ).toISOString();
  }
  return date.toISOString();
}

export function entryTypeLabel(type, language = "en") {
  if (type === "invoice") return translate(language, "entry.bill");
  if (type === "due" || type === "gave") return translate(language, "entry.due");
  if (type === "got") return translate(language, "entry.payment");
  return translate(language, "common.entry");
}

const PLACEHOLDER_NOTE_KEYS = [
  "common.bill",
  "entry.bill",
  "entry.paid",
  "entry.payment",
  "entry.due",
];

function isPlaceholderNote(note) {
  const value = note.trim().toLowerCase();
  if (!value) return true;
  return ["en", "hi", "hinglish"].some((lang) =>
    PLACEHOLDER_NOTE_KEYS.some(
      (key) => translate(lang, key).trim().toLowerCase() === value
    )
  );
}

/** One-line list title: the note when there is one, otherwise Bill / Payment / Due. */
export function entryListTitle(entry, language = "en") {
  const note = String(entry?.description || "")
    .replace(/\s+/g, " ")
    .trim();
  if (note && !isPlaceholderNote(note)) return note;
  return entryTypeLabel(entry?.type, language);
}

export function formatBillNumber(entry) {
  const d = new Date(entry?.date || Date.now());
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  // Use a longer slice of the unique id so same-day bills never share a number.
  const suffix = String(entry?.id || "XXXXXX")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-6)
    .toUpperCase()
    .padStart(6, "X");
  const prefix =
    entry?.type === "invoice" ? "BL" : entry?.type === "due" ? "DU" : "RC";
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

/** Date inputs are YYYY-MM-DD (UTC midnight). Keep the shop's local clock time. */
export function toEntryTimestamp(value = "", now = new Date()) {
  const raw = String(value || "").trim();
  const dateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    const local = new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    );
    return local.toISOString();
  }
  if (raw) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return now.toISOString();
}

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function firstName(name = "") {
  return String(name).trim().split(/\s+/).filter(Boolean)[0] || "";
}

export function initials(name = "") {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => {
      const ch = [...part][0] || "";
      return /[a-z]/i.test(ch) ? ch.toUpperCase() : ch;
    })
    .filter(Boolean);

  const isLatin = letters.every((ch) => /[A-Z]/.test(ch));
  return letters.join(isLatin ? "" : " ");
}

export function uid(prefix = "id") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

/** Always returns an id that is not already in `existingIds`. */
export function uniqueUid(prefix, existingIds = []) {
  const taken = existingIds instanceof Set ? existingIds : new Set(existingIds);
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const id = uid(prefix);
    if (!taken.has(id)) return id;
  }
  // Extremely unlikely fallback — still unique vs prior attempts via counter.
  return `${prefix}_${Date.now().toString(36)}_${taken.size}_${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}
