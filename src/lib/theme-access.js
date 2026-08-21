/** Paid bill + QR themes are free when this is on. Billing code stays in the app. */
export function arePaidThemesFree() {
  const raw = String(process.env.NEXT_PUBLIC_THEMES_FREE || "")
    .trim()
    .toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes";
}

export function isCatalogThemeFree(theme) {
  return Boolean(theme?.free) || arePaidThemesFree();
}
