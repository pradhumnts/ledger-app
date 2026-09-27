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

/** "Hill Road, Bandra West, Mumbai 400050" → "Bandra West, Mumbai" */
export function areaFrom(address) {
  const parts = String(address || "")
    .split(/[,\n]/)
    .map((part) => part.replace(/\b\d{3}\s?\d{3}\b/g, "").replace(/[\s-]+$/, "").trim())
    .filter((part) => part && !/^india$/i.test(part));
  return parts.slice(-2).join(", ");
}

/** Headline → [plain, italic, plain]: "Beauty, beautifully personal." → "Beauty," / "beautifully" / "personal." */
export function splitTitle(title) {
  const text = String(title || "").trim();
  const mark = text.search(/[,:;]\s/);
  if (mark > 0 && mark < text.length - 2) {
    const [accent, ...tail] = text.slice(mark + 1).trim().split(/\s+/);
    return [text.slice(0, mark + 1), accent, tail.join(" ")];
  }
  const words = text.split(/\s+/);
  if (words.length < 3) return [text, "", ""];
  const take = words.length > 4 ? 2 : 1;
  return [words.slice(0, -take).join(" "), words.slice(-take).join(" "), ""];
}

export function mapsUrl(address) {
  const query = String(address || "").trim();
  if (!query) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function instagramHandle(value) {
  return String(value || "")
    .trim()
    .replace(/^(https?:\/\/)?(www\.|m\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "")
    .replace(/[^A-Za-z0-9._]/g, "")
    .slice(0, 30);
}

const SOCIAL_HOSTS = {
  facebook: ["facebook.com", "www.facebook.com", "m.facebook.com", "fb.com", "www.fb.com", "fb.me"],
  youtube: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"],
};

function socialLink(value) {
  const raw = String(value || "").trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^(www\.|m\.)?(facebook|fb|youtube|youtu)\.(com|be|me)\//i.test(raw)) return `https://${raw}`;
  return "";
}

/** Stored form of a social account: a username, or a full https link for Facebook/YouTube. */
export function cleanSocial(kind, value) {
  if (kind === "instagram") return instagramHandle(value);
  const link = socialLink(value);
  if (link) {
    try {
      const url = new URL(link);
      const host = url.hostname.toLowerCase();
      if (!SOCIAL_HOSTS[kind]?.includes(host)) return "";
      const profileId = url.pathname === "/profile.php" ? url.searchParams.get("id") : "";
      const path = url.pathname.replace(/\/+$/, "");
      const query = profileId && /^\d+$/.test(profileId) ? `?id=${profileId}` : "";
      return `https://${host}${path}${query}`.slice(0, 200);
    } catch {
      return "";
    }
  }
  return String(value || "")
    .trim()
    .replace(/^@/, "")
    .replace(/[^A-Za-z0-9._-]/g, "")
    .slice(0, 60);
}

export function socialUrl(kind, value) {
  const cleaned = cleanSocial(kind, value);
  if (!cleaned) return "";
  if (cleaned.startsWith("https://")) return cleaned;
  if (kind === "instagram") return `https://instagram.com/${cleaned}`;
  if (kind === "facebook") return `https://facebook.com/${cleaned}`;
  if (kind === "youtube") return `https://youtube.com/@${cleaned}`;
  return "";
}

export function formatRupees(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}
