export function rupeesToPaise(amount) {
  const rupees = Number(amount);
  if (!Number.isFinite(rupees)) return 0;
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise) {
  const value = Number(paise);
  if (!Number.isFinite(value)) return 0;
  return value / 100;
}

/** Maps the live app entry.type to the DB enum `kind`. */
export function entryTypeToKind(type) {
  if (type === "invoice" || type === "got" || type === "due" || type === "gave") {
    return type;
  }
  return "invoice";
}
