import { BILL_THEMES } from "@/lib/bill-themes";
import { QR_THEMES } from "@/lib/qr-themes";
import { indianMobileDigits } from "@/lib/supabase/phone";

function adminPhones() {
  const extra = String(process.env.NEXT_PUBLIC_ADMIN_THEME_PHONES || "");
  return new Set(
    ["8740074255", ...extra.split(",")]
      .map((item) => indianMobileDigits(item))
      .filter((item) => item.length === 10)
  );
}

export function isThemeAdminPhone(phone) {
  const digits = indianMobileDigits(phone);
  return digits.length === 10 && adminPhones().has(digits);
}

export function paidBillThemeIds() {
  return BILL_THEMES.filter((theme) => !theme.free).map((theme) => theme.id);
}

export function paidQrThemeIds() {
  return QR_THEMES.filter((theme) => !theme.free).map((theme) => theme.id);
}

export function mergeAdminThemeUnlocks(settings, ...phones) {
  if (!settings) return settings;
  if (!phones.some((phone) => isThemeAdminPhone(phone))) return settings;
  const bill = new Set([
    ...(settings.unlockedBillThemes || []),
    ...paidBillThemeIds(),
  ]);
  const qr = new Set([
    ...(settings.unlockedQrThemes || []),
    ...paidQrThemeIds(),
  ]);
  return {
    ...settings,
    unlockedBillThemes: [...bill],
    unlockedQrThemes: [...qr],
  };
}
