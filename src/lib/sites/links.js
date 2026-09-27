/** Pure helpers shared by the live site and the in-app preview. */

export function phoneDigits(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits.slice(-10);
}

export function whatsappUrl(phone, message = "") {
  const digits = phoneDigits(phone);
  if (digits.length !== 10) return "";
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/91${digits}${text}`;
}

export function telUrl(phone) {
  const digits = phoneDigits(phone);
  return digits.length === 10 ? `tel:+91${digits}` : "";
}

export function mapsUrl(address) {
  const query = String(address || "").trim();
  if (!query) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function instagramHandle(value) {
  return String(value || "")
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "")
    .replace(/[^A-Za-z0-9._]/g, "")
    .slice(0, 30);
}

export function instagramUrl(value) {
  const handle = instagramHandle(value);
  return handle ? `https://instagram.com/${handle}` : "";
}

export function formatRupees(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}
