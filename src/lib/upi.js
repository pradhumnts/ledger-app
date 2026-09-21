import { rupeesToPaise, paiseToRupees } from "./supabase/money.js";

const UPI_ID = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9]{2,}$/;

export function isValidUpiId(value) {
  return UPI_ID.test(String(value || "").trim());
}

/**
 * UPI payload for QR encoding (scan & pay).
 * Keep `pa` `@` literal — URLSearchParams %40 breaks some apps.
 */
export function buildUpiPaymentUrl({ upiId, name, amount }) {
  const pa = String(upiId || "").trim();
  if (!isValidUpiId(pa)) return "";

  const parts = [`pa=${pa}`];
  const pn = String(name || "").trim();
  if (pn) parts.push(`pn=${encodeURIComponent(pn)}`);
  const paise = rupeesToPaise(amount);
  if (paise > 0) {
    parts.push(`am=${paiseToRupees(paise).toFixed(2)}`);
  }
  parts.push("cu=INR");

  return `upi://pay?${parts.join("&")}`;
}
