export const HOLD_DAYS = 14;
export const AFFILIATE_REWARD_PAISE = 30_000;
export const SHOP_REWARD_PAISE = 10_000;
/** Shops ask for a payout only once this much has cleared, to keep UPI transfers few. */
export const SHOP_MIN_PAYOUT_PAISE = 30_000;
export const REFERRAL_DISCOUNT_PERCENT = 10;

const UPI_ID = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9]{2,}$/;

export function isUpiId(value) {
  return UPI_ID.test(String(value || "").trim());
}

const DAY_MS = 24 * 60 * 60 * 1000;
const CODE_ALPHABET = "23456789";

/** "rahul " → "RAHUL". Empty when it can't be a code. */
export function normalizeCode(value) {
  const code = String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return code.length >= 3 && code.length <= 20 ? code : "";
}

/** Shop code from the business name: "Sharma Kirana" → "SHARMA" + 3 digits. */
export function shopCodeCandidate(name, random = Math.random) {
  const letters = String(name || "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 6);
  const prefix = letters.length >= 3 ? letters : "SHOP";
  let suffix = "";
  for (let i = 0; i < 3; i += 1) {
    suffix += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  }
  return `${prefix}${suffix}`;
}

/** The `ref` code in a Play install referrer string ("ref=RAHUL&utm_source=…"). */
export function codeFromReferrer(referrer) {
  try {
    return normalizeCode(new URLSearchParams(String(referrer || "")).get("ref"));
  } catch {
    return "";
  }
}

function yearlyPlanIds() {
  return String(process.env.SITES_YEARLY_BASE_PLAN_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function referralOfferId() {
  return String(process.env.REFERRAL_OFFER_ID || "referral-10").trim();
}

/** Yearly base plan: listed in SITES_YEARLY_BASE_PLAN_IDS, else named like one. */
export function isYearlyPlan({ basePlanId, offerId } = {}) {
  if (offerId && offerId === referralOfferId()) return true;
  const id = String(basePlanId || "");
  if (!id) return false;
  const listed = yearlyPlanIds();
  if (listed.length) return listed.includes(id);
  return /year|annual|p1y|12m/i.test(id);
}

export function holdUntil(from, days = HOLD_DAYS) {
  const start = new Date(from || Date.now()).getTime();
  return new Date((Number.isFinite(start) ? start : Date.now()) + days * DAY_MS).toISOString();
}

export function addMonths(value, months = 1) {
  const date = new Date(value);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, last));
  return date;
}

/** "Sharma Kirana Store" → "Sha••• Kir•••": enough to recognise, not to identify. */
export function maskName(name) {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!words.length) return "";
  return words
    .map((word) => {
      const chars = [...word];
      return chars.length <= 3 ? `${chars[0]}••` : `${chars.slice(0, 3).join("")}•••`;
    })
    .join(" ");
}

export function referralLink(siteUrl, code) {
  return `${String(siteUrl).replace(/\/$/, "")}/r/${code}`;
}

/** `fn` over `items`, at most `size` at a time (keeps Google / DB calls bounded). */
export async function mapInBatches(items, size, fn) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
  }
  return out;
}
