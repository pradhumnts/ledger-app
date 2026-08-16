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
