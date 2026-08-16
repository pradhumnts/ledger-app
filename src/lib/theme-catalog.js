import { BILL_THEME_PRICE, BILL_THEMES } from "./bill-themes.js";
import { QR_THEME_PRICE, QR_THEMES } from "./qr-themes.js";
import { rupeesToPaise } from "./supabase/money.js";

export function getPaidTheme(kind, themeId) {
  const id = String(themeId || "").trim();
  if (kind === "bill") {
    const theme = BILL_THEMES.find((item) => item.id === id);
    if (!theme || theme.free) return null;
    return {
      kind: "bill",
      themeId: theme.id,
      name: theme.name,
      amountPaise: rupeesToPaise(BILL_THEME_PRICE),
    };
  }
  if (kind === "qr") {
    const theme = QR_THEMES.find((item) => item.id === id);
    if (!theme || theme.free) return null;
    return {
      kind: "qr",
      themeId: theme.id,
      name: theme.name,
      amountPaise: rupeesToPaise(QR_THEME_PRICE),
    };
  }
  return null;
}

export function playSkuFor(kind, themeId) {
  const theme = getPaidTheme(kind, themeId);
  if (!theme) return "";
  return `${theme.kind}_theme_${theme.themeId.replace(/-/g, "_")}`;
}

export function themeFromPlaySku(sku) {
  const raw = String(sku || "").trim();
  const bill = raw.match(/^bill_theme_(.+)$/);
  if (bill) return getPaidTheme("bill", bill[1].replace(/_/g, "-"));
  const qr = raw.match(/^qr_theme_(.+)$/);
  if (qr) return getPaidTheme("qr", qr[1].replace(/_/g, "-"));
  return null;
}

export function allPlaySkus() {
  return [
    ...BILL_THEMES.filter((theme) => !theme.free).map((theme) =>
      playSkuFor("bill", theme.id)
    ),
    ...QR_THEMES.filter((theme) => !theme.free).map((theme) =>
      playSkuFor("qr", theme.id)
    ),
  ];
}
