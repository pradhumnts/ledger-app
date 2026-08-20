import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { APP_NAME } from "@/lib/branding";
import { GEIST_REGULAR_TTF_B64 } from "@/lib/og/geist-regular-b64";
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
  const len = String(label).length;
  if (len <= 6) return 168;
  if (len <= 9) return 136;
  if (len <= 12) return 108;
  return 88;
}

function publicBillSvg(snapshot) {
  const shopName = snapshot?.business?.name?.trim() || APP_NAME;
  const amount = snapshot ? publicBillDisplayAmount(snapshot) : "-";
  const initials = publicBillShopInitials(shopName);
  const nameLabel = clipPublicBillName(shopName);
  const fontSize = amountFontSize(amount);
  const pillWidth = Math.min(520, 86 + nameLabel.length * 20);
  const pillX = OG_SIZE.width - 64 - pillWidth;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${OG_SIZE.width}" height="${OG_SIZE.height}" viewBox="0 0 ${OG_SIZE.width} ${OG_SIZE.height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${FOREST}"/>
  <circle cx="110" cy="102" r="46" fill="#ffffff"/>
  <text x="110" y="114" text-anchor="middle" font-family="Geist" font-size="28" font-weight="700" fill="${FOREST}">MK</text>
  <rect x="${pillX}" y="60" width="${pillWidth}" height="84" rx="42" fill="${LIME}"/>
  <circle cx="${pillX + 42}" cy="102" r="28" fill="${FOREST}"/>
  <text x="${pillX + 42}" y="110" text-anchor="middle" font-family="Geist" font-size="22" font-weight="700" fill="${LIME}">${xml(initials)}</text>
  <text x="${pillX + 82}" y="112" font-family="Geist" font-size="32" font-weight="700" fill="${FOREST}">${xml(nameLabel)}</text>
  <text x="600" y="360" text-anchor="middle" font-family="Geist" font-size="${fontSize}" font-weight="700" fill="${LIME}">${xml(amount)}</text>
  <text x="600" y="448" text-anchor="middle" font-family="Geist" font-size="72" font-weight="700" fill="${LIME}">INR</text>
</svg>`;
}

export async function renderPublicBillOgImage(snapshot) {
  const { Resvg } = await import("@resvg/resvg-js");
  const fontFile = geistFontPath();
  const resvg = new Resvg(publicBillSvg(snapshot), {
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
