import { rupeesToPaise, paiseToRupees } from "./supabase/money.js";

export function buildUpiPaymentUrl({ upiId, name, amount }) {
  const pa = String(upiId || "").trim();
  if (!pa) return "";

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
