/**
 * Digital business cards (moneykitapp.com/c/SLUG). The admin panel saves the
 * card as loose JSON; everything here reads it defensively. Pure module.
 */

export const CARD_SLUG = /^[a-z0-9]{8,32}$/;

/** Kept in step with the admin panel's card form. */
export const CARD_THEMES = {
  midnight: { label: "Midnight", from: "#0b1222", to: "#1d2b4f", accent: "#d9b77e", glow: "#4c6fff" },
  emerald: { label: "Emerald", from: "#04261f", to: "#0f4a3c", accent: "#9fe0bf", glow: "#2fd39a" },
  plum: { label: "Plum", from: "#1c0f33", to: "#3b2470", accent: "#cdb8ff", glow: "#9a5cff" },
  graphite: { label: "Graphite", from: "#0d0d0f", to: "#2a2a30", accent: "#f2f2f2", glow: "#7c7c92" },
};
export const DEFAULT_CARD_THEME = "midnight";

export const CARD_SOCIALS = [
  { id: "linkedin", label: "LinkedIn", url: (h) => `https://www.linkedin.com/in/${h}` },
  { id: "instagram", label: "Instagram", url: (h) => `https://www.instagram.com/${h}` },
  { id: "x", label: "X", url: (h) => `https://x.com/${h}` },
  { id: "facebook", label: "Facebook", url: (h) => `https://www.facebook.com/${h}` },
  { id: "youtube", label: "YouTube", url: (h) => `https://www.youtube.com/@${h}` },
];

const MAX_LINKS = 4;

function str(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** "+91 87400 74255", "8740074255" or "918740074255" → "+918740074255". */
export function phoneE164(value) {
  const raw = str(value, 32);
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 6) return "";
  if (raw.startsWith("+")) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  return `+${digits}`;
}

/** "+918740074255" → "+91 87400 74255"; other countries stay as they are. */
export function formatPhone(e164) {
  const match = /^\+91(\d{5})(\d{5})$/.exec(e164 || "");
  return match ? `+91 ${match[1]} ${match[2]}` : e164 || "";
}

/** Adds https:// to bare domains; anything that isn't http(s) is dropped. */
export function webUrl(value) {
  const raw = str(value, 300);
  if (!raw) return "";
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    if (!url.hostname.includes(".")) return "";
    return url.toString();
  } catch {
    return "";
  }
}

/** "moneykitapp.com" for showing a website without its scheme or trailing slash. */
export function displayUrl(url) {
  return (url || "").replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
}

/** A profile URL, or a handle like "@pradyumn" turned into one. */
function socialUrl(social, value) {
  const raw = str(value, 300);
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || /\.[a-z]{2,}\//i.test(raw)) return webUrl(raw);
  const handle = raw.replace(/^@/, "");
  return /^[\w.-]{1,100}$/.test(handle) ? social.url(handle) : "";
}

function email(value) {
  const raw = str(value, 160);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) ? raw : "";
}

/** The stored card, cleaned up for showing. Unknown or broken fields drop out. */
export function normalizeCard(input) {
  const card = input && typeof input === "object" ? input : {};
  const socials = card.socials && typeof card.socials === "object" ? card.socials : {};
  const phone = phoneE164(card.phone);
  return {
    name: str(card.name, 80),
    title: str(card.title, 80),
    company: str(card.company, 80),
    headline: str(card.headline, 140),
    bio: str(card.bio, 600),
    photo: webUrl(card.photo),
    logo: webUrl(card.logo),
    phone,
    whatsapp: card.whatsapp === false ? "" : phoneE164(card.whatsapp) || phone,
    email: email(card.email),
    website: webUrl(card.website),
    address: str(card.address, 200),
    mapUrl: webUrl(card.mapUrl),
    socials: CARD_SOCIALS.map((social) => ({
      id: social.id,
      label: social.label,
      url: socialUrl(social, socials[social.id]),
    })).filter((social) => social.url),
    links: (Array.isArray(card.links) ? card.links : [])
      .map((link) => ({ label: str(link?.label, 40), url: webUrl(link?.url) }))
      .filter((link) => link.label && link.url)
      .slice(0, MAX_LINKS),
    theme: CARD_THEMES[card.theme] ? card.theme : DEFAULT_CARD_THEME,
  };
}

export function whatsappHref(e164) {
  return e164 ? `https://wa.me/${e164.replace(/\D/g, "")}` : "";
}

export function mapsHref(card) {
  if (card.mapUrl) return card.mapUrl;
  return card.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(card.address)}`
    : "";
}

/** "Pradyumn Vaishnav" → "PV". */
export function initials(name) {
  const parts = (name || "").split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? [parts[0], parts.at(-1)] : parts;
  return letters.map((part) => part[0].toUpperCase()).join("") || "•";
}

/** "Pradyumn Vaishnav – Founder, MoneyKit". */
export function cardTitle(card) {
  const role = [card.title, card.company].filter(Boolean).join(", ");
  return [card.name || "Business card", role].filter(Boolean).join(" – ");
}

function escapeText(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/** vCard lines may be at most 75 octets; longer ones continue after CRLF + space. */
function fold(line) {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const decoder = new TextDecoder();
  const parts = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Never split a multi-byte character.
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end -= 1;
    parts.push(decoder.decode(bytes.slice(start, end)));
    start = end;
    limit = 74;
  }
  return parts.join("\r\n ");
}

/**
 * A vCard 3.0 that iOS and Android contacts both import. `photo` is an
 * optional base64 JPEG. Social profiles and links become labelled URLs.
 */
export function cardVcard(card, { photo = "", cardUrl = "" } = {}) {
  const nameParts = (card.name || "").split(/\s+/).filter(Boolean);
  const last = nameParts.length > 1 ? nameParts.at(-1) : "";
  const first = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : nameParts[0] || "";
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeText(last)};${escapeText(first)};;;`,
    `FN:${escapeText(card.name || card.company || "Contact")}`,
  ];
  if (card.company) lines.push(`ORG:${escapeText(card.company)}`);
  if (card.title) lines.push(`TITLE:${escapeText(card.title)}`);
  if (card.phone) lines.push(`TEL;TYPE=CELL,VOICE:${card.phone}`);
  if (card.whatsapp && card.whatsapp !== card.phone) lines.push(`TEL;TYPE=CELL:${card.whatsapp}`);
  if (card.email) lines.push(`EMAIL;TYPE=INTERNET,WORK:${escapeText(card.email)}`);
  if (card.website) lines.push(`URL;TYPE=WORK:${escapeText(card.website)}`);
  if (card.address) lines.push(`ADR;TYPE=WORK:;;${escapeText(card.address)};;;;`);

  const labelled = [
    ...card.socials.map((social) => ({ label: social.label, url: social.url })),
    ...card.links,
    ...(cardUrl ? [{ label: "Digital card", url: cardUrl }] : []),
  ];
  labelled.forEach((item, index) => {
    lines.push(`item${index + 1}.URL:${escapeText(item.url)}`);
    lines.push(`item${index + 1}.X-ABLabel:${escapeText(item.label)}`);
  });

  const note = [card.headline, card.bio].filter(Boolean).join("\n\n");
  if (note) lines.push(`NOTE:${escapeText(note)}`);
  if (photo) lines.push(`PHOTO;ENCODING=b;TYPE=JPEG:${photo}`);
  lines.push("END:VCARD");
  return `${lines.map(fold).join("\r\n")}\r\n`;
}

/** "Pradyumn Vaishnav.vcf", safe for a Content-Disposition header. */
export function vcardFilename(card) {
  const base = (card.name || card.company || "contact").replace(/[^\w .-]/g, "").trim() || "contact";
  return `${base.slice(0, 60)}.vcf`;
}
