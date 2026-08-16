import { rupeesToPaise, paiseToRupees } from "./supabase/money.js";
import { APP_SITE_URL } from "./branding.js";

const UPI_ID = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9]{2,}$/;

export function isValidUpiId(value) {
  return UPI_ID.test(String(value || "").trim());
}

export function buildUpiPaymentUrl({ upiId, name, amount }) {
  const pa = String(upiId || "").trim();
  if (!isValidUpiId(pa)) return "";

  const params = new URLSearchParams();
  params.set("pa", pa);
  if (name?.trim()) params.set("pn", name.trim());
  const paise = rupeesToPaise(amount);
  if (paise > 0) {
    params.set("am", paiseToRupees(paise).toFixed(2));
  }
  params.set("cu", "INR");

  return `upi://pay?${params.toString()}`;
}

/** Clickable https link for WhatsApp/SMS that opens the UPI app. */
export function buildHttpsPayLink({
  upiId,
  name,
  amount,
  origin = APP_SITE_URL,
}) {
  const pa = String(upiId || "").trim();
  if (!isValidUpiId(pa)) return "";

  const base = String(origin || APP_SITE_URL).replace(/\/$/, "");
  const url = new URL(`${base}/p`);
  url.searchParams.set("pa", pa);
  if (name?.trim()) url.searchParams.set("pn", name.trim().slice(0, 60));
  const paise = rupeesToPaise(amount);
  if (paise > 0) {
    url.searchParams.set("am", paiseToRupees(paise).toFixed(2));
  }
  return url.toString();
}
