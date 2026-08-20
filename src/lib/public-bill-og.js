import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { APP_NAME } from "@/lib/branding";
import { GEIST_REGULAR_TTF_B64 } from "@/lib/og/geist-regular-b64";
import { isPublicStatement } from "@/lib/public-bill";
import {
  clipPublicBillName,
  publicBillDisplayAmount,
  publicBillShopInitials,
} from "@/lib/public-bill-meta";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const FOREST = "#0b301f";
const LIME = "#c8e86a";

let cachedFontPath = "";

function geistFontPath() {
  if (cachedFontPath) return cachedFontPath;
  const dest = join(tmpdir(), "moneykit-geist-regular.ttf");
  writeFileSync(dest, Buffer.from(GEIST_REGULAR_TTF_B64, "base64"));
  cachedFontPath = dest;
  return dest;
}

function xml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function amountFontSize(label) {
  const digits = String(label).replace(/[^0-9]/g, "").length;
  if (digits <= 3) return 280;
  if (digits <= 4) return 248;
  if (digits <= 5) return 208;
  if (digits <= 7) return 168;
  return 128;
}

function moneyKitLogoMark() {
  return `
  <svg x="64" y="56" width="92" height="92" viewBox="0 0 1024 1024">
    <defs>
      <clipPath id="mkLogoClip">
        <circle cx="512" cy="512" r="512"/>
      </clipPath>
    </defs>
    <g clip-path="url(#mkLogoClip)">
      <path d="M1024 0H0V1024H1024V0Z" fill="#ffffff"/>
      <path d="M290.19 324.63C269.69 324.63 253.29 341.03 253.29 361.53V731.35C253.29 777.27 290.19 814.17 336.11 814.17H703.47C749.39 814.17 786.29 777.27 786.29 731.35V361.53C786.29 341.03 769.89 324.63 749.39 324.63H290.19Z" fill="#062D1A"/>
      <path d="M359.89 209.83H679.69C706.75 209.83 728.89 231.97 728.89 259.03V291.83C718.23 287.73 706.75 285.27 694.45 285.27H345.13C332.83 285.27 322.17 287.73 311.51 291.83V259.03C311.51 231.97 332.83 209.83 359.89 209.83Z" fill="#062D1A"/>
      <path d="M336.93 298.39H701.83C729.71 298.39 751.85 320.53 751.85 348.41V392.69C737.91 385.31 722.33 381.21 705.93 381.21H332.83C316.43 381.21 300.85 385.31 286.91 392.69V348.41C286.91 320.53 309.05 298.39 336.93 298.39Z" fill="#C1F07F" stroke="#ffffff" stroke-width="16.4" stroke-linejoin="round"/>
      <path d="M448.45 484.53H591.13L577.19 523.07H462.39L448.45 484.53Z" fill="#ffffff"/>
      <path d="M476.33 536.19H573.09V551.77L523.07 564.07C516.51 565.71 514.87 571.45 519.79 577.19L573.91 637.05H541.93L476.33 591.13V536.19Z" fill="#ffffff"/>
    </g>
  </svg>`;
}

function shopPill(shopName) {
  const initials = publicBillShopInitials(shopName);
  const nameLabel = clipPublicBillName(shopName);
  const pillWidth = Math.min(520, 86 + nameLabel.length * 20);
  const pillX = OG_SIZE.width - 64 - pillWidth;
  return `
  <rect x="${pillX}" y="60" width="${pillWidth}" height="84" rx="42" fill="${LIME}"/>
  <circle cx="${pillX + 42}" cy="102" r="28" fill="${FOREST}"/>
  <text x="${pillX + 42}" y="110" text-anchor="middle" font-family="Geist" font-size="22" font-weight="700" fill="${LIME}">${xml(initials)}</text>
  <text x="${pillX + 82}" y="112" font-family="Geist" font-size="32" font-weight="700" fill="${FOREST}">${xml(nameLabel)}</text>`;
}

function publicBillSvg(snapshot) {
  const shopName = snapshot?.business?.name?.trim() || APP_NAME;
  const amount = snapshot ? publicBillDisplayAmount(snapshot) : "-";
  const fontSize = amountFontSize(amount);
  const currencySize = Math.round(fontSize * 0.4);
  const stroke = Math.max(4, Math.round(fontSize / 36));
  const amountY = 392;
  const currencyY = amountY + Math.round(currencySize * 1.18);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${OG_SIZE.width}" height="${OG_SIZE.height}" viewBox="0 0 ${OG_SIZE.width} ${OG_SIZE.height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${FOREST}"/>
  ${moneyKitLogoMark()}
  ${shopPill(shopName)}
  <text x="600" y="${amountY}" text-anchor="middle" font-family="Geist" font-size="${fontSize}" font-weight="700" fill="${LIME}" stroke="${LIME}" stroke-width="${stroke}" paint-order="stroke fill" letter-spacing="-10">${xml(amount)}</text>
  <text x="600" y="${currencyY}" text-anchor="middle" font-family="Geist" font-size="${currencySize}" font-weight="700" fill="${LIME}" stroke="${LIME}" stroke-width="${Math.max(2, Math.round(stroke * 0.45))}" paint-order="stroke fill" letter-spacing="6">${xml("INR")}</text>
</svg>`;
}

function publicStatementSvg(snapshot) {
  const shopName = snapshot?.business?.name?.trim() || APP_NAME;
  const customer = clipPublicBillName(
    snapshot?.customer?.name?.trim() || "Customer",
    28
  );
  const nameSize = customer.length <= 12 ? 52 : customer.length <= 20 ? 42 : 34;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${OG_SIZE.width}" height="${OG_SIZE.height}" viewBox="0 0 ${OG_SIZE.width} ${OG_SIZE.height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${FOREST}"/>
  ${moneyKitLogoMark()}
  ${shopPill(shopName)}
  <text x="600" y="368" text-anchor="middle" font-family="Geist" font-size="148" font-weight="700" fill="${LIME}" stroke="${LIME}" stroke-width="4" paint-order="stroke fill" letter-spacing="6">${xml("ALL BILLS")}</text>
  <text x="600" y="456" text-anchor="middle" font-family="Geist" font-size="${nameSize}" font-weight="700" fill="#ffffff" letter-spacing="1">${xml(customer)}</text>
</svg>`;
}

function publicShareSvg(snapshot) {
  if (isPublicStatement(snapshot)) return publicStatementSvg(snapshot);
  return publicBillSvg(snapshot);
}

export async function renderPublicBillOgImage(snapshot) {
  const { Resvg } = await import("@resvg/resvg-js");
  const fontFile = geistFontPath();
  const resvg = new Resvg(publicShareSvg(snapshot), {
    fitTo: { mode: "width", value: OG_SIZE.width },
    font: {
      fontFiles: [fontFile],
      loadSystemFonts: false,
      defaultFontFamily: "Geist",
    },
  });
  const png = resvg.render().asPng();
  return new Response(png, {
    headers: {
      "Content-Type": OG_CONTENT_TYPE,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
