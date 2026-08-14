export function buildUpiPaymentUrl({ upiId, name, amount }) {
  const pa = String(upiId || "").trim();
  if (!pa) return "";

  const params = new URLSearchParams();
  params.set("pa", pa);
  if (name?.trim()) params.set("pn", name.trim());
  const value = Number(amount);
  if (Number.isFinite(value) && value > 0) {
    params.set("am", String(value));
  }
  params.set("cu", "INR");

  return `upi://pay?${params.toString()}`;
}
