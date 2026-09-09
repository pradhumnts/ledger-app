import { BILL_THEMES } from "@/lib/bill-themes";
import { BUSINESS_TYPES } from "@/lib/business-types";
import { QR_THEMES } from "@/lib/qr-themes";

export function adminThemeName(kind, themeId) {
  const list = kind === "qr" ? QR_THEMES : BILL_THEMES;
  return list.find((theme) => theme.id === themeId)?.name || themeId;
}

export function adminBusinessTypeLabel(typeId) {
  if (!typeId) return "";
  const known = BUSINESS_TYPES.find((type) => type.id === typeId);
  if (!known) return typeId;
  return typeId
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function resolveBusinessLogoUrl(admin, logoPath) {
  if (!admin || !logoPath) return null;
  try {
    const { data, error } = await admin.storage
      .from("business-logos")
      .createSignedUrl(logoPath, 60 * 60);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}
