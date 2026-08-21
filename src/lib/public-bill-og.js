import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getBillTheme } from "@/lib/bill-themes";
import { APP_NAME } from "@/lib/branding";
import {
  entryTypeLabel,
  formatBillNumber,
  formatEntryDate,
  formatINR,
} from "@/lib/format";
import { GEIST_REGULAR_TTF_B64 } from "@/lib/og/geist-regular-b64";
import { isPublicStatement } from "@/lib/public-bill";
import {
  clipPublicBillName,
  publicBillShopInitials,
} from "@/lib/public-bill-meta";

export const OG_SIZE = { width: 1200, height: 900 };
export const OG_CONTENT_TYPE = "image/png";

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

function clip(value, max) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(1, max - 1)).trimEnd()}…`;
}

function hex(rgb, fallback) {
  if (!Array.isArray(rgb) || rgb.length < 3) return fallback;
  return `#${rgb
    .slice(0, 3)
    .map((n) => Math.max(0, Math.min(255, Number(n) || 0))
      .toString(16)
      .padStart(2, "0"))
    .join("")}`;
}

function logoHref(logo) {
  const value = String(logo || "").trim();
  if (
    value.startsWith("data:image/jpeg") ||
    value.startsWith("data:image/jpg") ||
    value.startsWith("data:image/png")
  ) {
    return value;
  }
  return "";
}

function billKicker(entry) {
  if (entry?.type === "got") return "PAYMENT";
  if (entry?.type === "due" || entry?.type === "gave") return "DUE";
  if (entry?.type === "invoice") return "BILL";
  return String(entryTypeLabel(entry?.type, "en") || "BILL").toUpperCase();
}

function showDue(entry) {
  const remaining = Number(entry?.due);
  if (!Number.isFinite(remaining) || remaining <= 0) return false;
  return (
    entry?.type === "got" ||
    (entry?.type === "invoice" && remaining !== Number(entry?.amount))
  );
}

function ogView(snapshot) {
  const theme = getBillTheme(snapshot?.themeId);
  const business = snapshot?.business || {};
  const customer = snapshot?.customer || {};
  const entry = snapshot?.entry || {};
  const statement = isPublicStatement(snapshot);
  const shop = clipPublicBillName(business.name?.trim() || APP_NAME, 28);
  const details = clip(
    [business.phone, business.address].filter(Boolean).join("  ·  "),
    54
  );
  const customerName = clip(customer.name?.trim() || "Customer", 32);
  const note = clip(
    statement
      ? "All bills"
      : entry.description?.trim() ||
          (entry.type === "got" ? "Paid" : "Bill"),
    48
  );
  const amount = statement
    ? formatINR(Math.abs(Number(snapshot?.balance) || 0))
    : formatINR(entry.amount);
  const dueAmount = statement
    ? formatINR(Number(snapshot?.billed) || 0)
    : formatINR(entry.due);
  const totalLabel = statement
    ? Number(snapshot?.balance) > 0
      ? "To collect"
      : Number(snapshot?.balance) < 0
        ? "To pay"
        : "Settled"
    : entry.type === "got"
      ? "Paid"
      : "Total";
  const kicker = statement ? "ALL BILLS" : billKicker(entry);
  const date = formatEntryDate(
    statement ? snapshot?.entries?.[0]?.date : entry.date,
    "en"
  );
  const billNo = statement ? "" : formatBillNumber(entry);
  const pdf = theme.pdf || {};

  return {
    style: theme.style || "invoice",
    shop,
    details,
    customerName,
    customerPhone: clip(customer.phone || "", 16),
    note,
    amount,
    dueAmount,
    showDue: statement ? true : showDue(entry),
    dueLabel: statement ? "Billed" : "Due",
    totalLabel,
    kicker,
    date,
    billNo,
    logo: logoHref(business.logo),
    initials: publicBillShopInitials(business.name),
    forest: hex(pdf.forest, "#0b301f"),
    lime: hex(pdf.lime, "#c8e86a"),
    ink: "#18181b",
    muted: "#71717a",
  };
}

function headerLogo(view, x, y, size, bg, fg) {
  if (view.logo) {
    return `
    <clipPath id="ogLogoClip">
      <circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}"/>
    </clipPath>
    <circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}" fill="${bg}"/>
    <image href="${xml(view.logo)}" x="${x}" y="${y}" width="${size}" height="${size}" clip-path="url(#ogLogoClip)" preserveAspectRatio="xMidYMid slice"/>`;
  }
  return `
    <circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}" fill="${bg}"/>
    <text x="${x + size / 2}" y="${y + size / 2 + 12}" text-anchor="middle" font-family="Geist" font-size="26" font-weight="700" fill="${fg}">${xml(view.initials)}</text>`;
}

function brandLine(x, y, fill) {
  return `<text x="${x}" y="${y}" font-family="Geist" font-size="18" fill="${fill}">Created with ${xml(APP_NAME)}</text>`;
}

function invoiceSvg(view) {
  return `
  <rect width="100%" height="100%" fill="#e7ebe6"/>
  <rect x="48" y="40" width="1104" height="820" rx="44" fill="#ffffff"/>
  <rect x="48" y="40" width="1104" height="268" rx="44" fill="${view.forest}"/>
  <rect x="48" y="220" width="1104" height="88" fill="${view.forest}"/>
  <text x="92" y="112" font-family="Geist" font-size="22" letter-spacing="4" fill="${view.lime}">${xml(view.kicker)}</text>
  <text x="92" y="178" font-family="Geist" font-size="52" font-weight="700" fill="#ffffff">${xml(view.shop)}</text>
  ${view.details ? `<text x="92" y="226" font-family="Geist" font-size="24" fill="#ffffff" opacity="0.7">${xml(view.details)}</text>` : ""}
  ${view.billNo ? `<text x="92" y="270" font-family="Geist" font-size="22" fill="#ffffff" opacity="0.55">Bill no. · ${xml(view.billNo)}</text>` : ""}
  ${headerLogo(view, 1028, 92, 88, view.lime, view.forest)}
  <text x="92" y="368" font-family="Geist" font-size="20" letter-spacing="2" fill="${view.muted}">BILLED TO</text>
  <text x="92" y="422" font-family="Geist" font-size="38" font-weight="700" fill="${view.ink}">${xml(view.customerName)}</text>
  ${view.customerPhone ? `<text x="92" y="466" font-family="Geist" font-size="24" fill="${view.muted}">${xml(view.customerPhone)}</text>` : ""}
  <text x="92" y="548" font-family="Geist" font-size="24" fill="${view.ink}">${xml(view.note)}</text>
  <text x="1108" y="548" text-anchor="end" font-family="Geist" font-size="24" fill="${view.ink}">${xml(view.amount)}</text>
  <rect x="76" y="588" width="1048" height="132" rx="26" fill="#f4f5f3"/>
  <text x="104" y="642" font-family="Geist" font-size="22" fill="${view.muted}">${xml(view.totalLabel)}</text>
  ${view.date ? `<text x="104" y="682" font-family="Geist" font-size="20" fill="#a1a1aa">${xml(view.date)}</text>` : ""}
  <text x="1092" y="678" text-anchor="end" font-family="Geist" font-size="56" font-weight="700" fill="${view.ink}">${xml(view.amount)}</text>
  ${
    view.showDue
      ? `<text x="92" y="770" font-family="Geist" font-size="24" fill="${view.muted}">${xml(view.dueLabel)}</text>
         <text x="1108" y="770" text-anchor="end" font-family="Geist" font-size="26" font-weight="700" fill="#1f8a4c">${xml(view.dueAmount)}</text>
         ${brandLine(92, 824, "#a1a1aa")}`
      : brandLine(92, 790, "#a1a1aa")
  }`;
}

function minimalSvg(view) {
  return `
  <rect width="100%" height="100%" fill="#f4f4f5"/>
  <rect x="48" y="40" width="1104" height="820" rx="44" fill="#ffffff" stroke="#18181b" stroke-width="4"/>
  <text x="92" y="128" font-family="Geist" font-size="22" letter-spacing="5" fill="#a1a1aa">${xml(view.kicker)}</text>
  <text x="92" y="204" font-family="Geist" font-size="56" font-weight="700" fill="${view.ink}">${xml(view.shop)}</text>
  ${view.details ? `<text x="92" y="254" font-family="Geist" font-size="24" fill="${view.muted}">${xml(view.details)}</text>` : ""}
  ${headerLogo(view, 1028, 92, 88, "#18181b", "#ffffff")}
  <line x1="92" y1="300" x2="1108" y2="300" stroke="#18181b" stroke-width="2"/>
  <text x="92" y="372" font-family="Geist" font-size="36" font-weight="700" fill="${view.ink}">${xml(view.customerName)}</text>
  ${view.date ? `<text x="1108" y="372" text-anchor="end" font-family="Geist" font-size="24" fill="${view.muted}">${xml(view.date)}</text>` : ""}
  <line x1="92" y1="424" x2="1108" y2="424" stroke="#d4d4d8" stroke-width="2" stroke-dasharray="8 10"/>
  <text x="92" y="492" font-family="Geist" font-size="26" fill="${view.ink}">${xml(view.note)}</text>
  <text x="1108" y="492" text-anchor="end" font-family="Geist" font-size="26" fill="${view.ink}">${xml(view.amount)}</text>
  <line x1="92" y1="536" x2="1108" y2="536" stroke="#d4d4d8" stroke-width="2" stroke-dasharray="8 10"/>
  <text x="92" y="640" font-family="Geist" font-size="22" letter-spacing="3" fill="#a1a1aa">${xml(view.totalLabel.toUpperCase())}</text>
  <text x="1108" y="660" text-anchor="end" font-family="Geist" font-size="64" font-weight="700" fill="${view.ink}">${xml(view.amount)}</text>
  ${
    view.showDue
      ? `<text x="92" y="750" font-family="Geist" font-size="24" fill="${view.muted}">${xml(view.dueLabel)}  ${xml(view.dueAmount)}</text>
         ${brandLine(92, 820, "#a1a1aa")}`
      : brandLine(92, 780, "#a1a1aa")
  }`;
}

function colorfulSvg(view) {
  return `
  <defs>
    <linearGradient id="ogColorful" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="48%" stop-color="#4338ca"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="#1e1b4b"/>
  <rect x="48" y="40" width="1104" height="820" rx="44" fill="url(#ogColorful)"/>
  <text x="92" y="128" font-family="Geist" font-size="22" letter-spacing="4" fill="#ffffff" opacity="0.65">${xml(view.kicker)}</text>
  <text x="92" y="198" font-family="Geist" font-size="50" font-weight="700" fill="#ffffff">${xml(view.shop)}</text>
  ${view.details ? `<text x="92" y="248" font-family="Geist" font-size="22" fill="#ffffff" opacity="0.65">${xml(view.details)}</text>` : ""}
  ${headerLogo(view, 1028, 92, 88, "#ffffff", "#1e1b4b")}
  <rect x="92" y="300" width="1016" height="220" rx="32" fill="#ffffff" fill-opacity="0.12"/>
  <text x="124" y="356" font-family="Geist" font-size="20" fill="#ffffff" opacity="0.65">Billed to</text>
  <text x="124" y="410" font-family="Geist" font-size="34" font-weight="700" fill="#ffffff">${xml(view.customerName)}</text>
  <text x="124" y="478" font-family="Geist" font-size="24" fill="#ffffff" opacity="0.85">${xml(view.note)}</text>
  <text x="1076" y="478" text-anchor="end" font-family="Geist" font-size="24" fill="#ffffff">${xml(view.amount)}</text>
  <text x="92" y="610" font-family="Geist" font-size="22" fill="#ffffff" opacity="0.65">${xml(view.totalLabel)}</text>
  <text x="92" y="700" font-family="Geist" font-size="72" font-weight="700" fill="#ffffff">${xml(view.amount)}</text>
  ${
    view.showDue
      ? `<text x="1108" y="690" text-anchor="end" font-family="Geist" font-size="24" fill="#ffffff">${xml(view.dueLabel)}  ${xml(view.dueAmount)}</text>`
      : ""
  }
  <text x="92" y="800" font-family="Geist" font-size="20" fill="#ffffff" opacity="0.5">Created with ${xml(APP_NAME)}</text>`;
}

function ticketSvg(view) {
  return `
  <rect width="100%" height="100%" fill="#17120c"/>
  <rect x="80" y="48" width="1040" height="804" rx="40" fill="#211a12" stroke="#d4a84b" stroke-width="3" stroke-dasharray="14 12" stroke-opacity="0.55"/>
  <text x="600" y="150" text-anchor="middle" font-family="Geist" font-size="22" letter-spacing="8" fill="#d4a84b">${xml(view.kicker)}</text>
  <text x="600" y="230" text-anchor="middle" font-family="Geist" font-size="50" font-weight="700" fill="#f6ead2">${xml(view.shop)}</text>
  <text x="600" y="286" text-anchor="middle" font-family="Geist" font-size="28" fill="#f6ead2" opacity="0.7">${xml(view.customerName)}</text>
  <line x1="180" y1="340" x2="1020" y2="340" stroke="#d4a84b" stroke-width="2" stroke-dasharray="10 12" stroke-opacity="0.35"/>
  <text x="600" y="410" text-anchor="middle" font-family="Geist" font-size="26" fill="#f6ead2" opacity="0.85">${xml(view.note)}</text>
  <text x="600" y="490" text-anchor="middle" font-family="Geist" font-size="22" letter-spacing="4" fill="#f6ead2" opacity="0.5">${xml(view.totalLabel.toUpperCase())}</text>
  <text x="600" y="590" text-anchor="middle" font-family="Geist" font-size="72" font-weight="700" fill="#d4a84b">${xml(view.amount)}</text>
  ${view.showDue ? `<text x="600" y="660" text-anchor="middle" font-family="Geist" font-size="24" fill="#f6ead2" opacity="0.75">${xml(view.dueLabel)}  ${xml(view.dueAmount)}</text>` : ""}
  <text x="600" y="740" text-anchor="middle" font-family="Geist" font-size="20" fill="#f6ead2" opacity="0.4">${xml(view.billNo || view.date || "")}</text>
  <text x="600" y="800" text-anchor="middle" font-family="Geist" font-size="18" fill="#f6ead2" opacity="0.35">Created with ${xml(APP_NAME)}</text>`;
}

function receiptSvg(view) {
  return `
  <rect width="100%" height="100%" fill="#e8dcc8"/>
  <rect x="160" y="40" width="880" height="820" fill="#f4ead6"/>
  <text x="600" y="130" text-anchor="middle" font-family="Geist" font-size="40" font-weight="700" fill="#2c2118">${xml(view.shop)}</text>
  ${view.details ? `<text x="600" y="178" text-anchor="middle" font-family="Geist" font-size="20" fill="#2c2118" opacity="0.7">${xml(view.details)}</text>` : ""}
  <text x="600" y="240" text-anchor="middle" font-family="Geist" font-size="20" letter-spacing="6" fill="#2c2118">${xml(view.kicker)}</text>
  <text x="600" y="288" text-anchor="middle" font-family="Geist" font-size="22" fill="#2c2118">${xml([view.date, view.billNo].filter(Boolean).join("  ·  "))}</text>
  <line x1="200" y1="330" x2="1000" y2="330" stroke="#2c2118" stroke-width="2" stroke-dasharray="7 8" stroke-opacity="0.4"/>
  <text x="220" y="400" font-family="Geist" font-size="26" fill="#2c2118">${xml(view.note)}</text>
  <text x="980" y="400" text-anchor="end" font-family="Geist" font-size="26" fill="#2c2118">${xml(view.amount)}</text>
  <line x1="200" y1="450" x2="1000" y2="450" stroke="#2c2118" stroke-width="2" stroke-dasharray="7 8" stroke-opacity="0.4"/>
  <text x="220" y="530" font-family="Geist" font-size="30" font-weight="700" fill="#2c2118">${xml(view.totalLabel.toUpperCase())}</text>
  <text x="980" y="530" text-anchor="end" font-family="Geist" font-size="40" font-weight="700" fill="#2c2118">${xml(view.amount)}</text>
  ${view.showDue ? `<text x="220" y="590" font-family="Geist" font-size="24" fill="#2c2118">${xml(view.dueLabel)}</text><text x="980" y="590" text-anchor="end" font-family="Geist" font-size="24" fill="#2c2118">${xml(view.dueAmount)}</text>` : ""}
  <text x="600" y="700" text-anchor="middle" font-family="Geist" font-size="24" fill="#2c2118">${xml(view.customerName)}</text>
  <text x="600" y="800" text-anchor="middle" font-family="Geist" font-size="18" letter-spacing="8" fill="#2c2118" opacity="0.55">CREATED WITH ${xml(APP_NAME.toUpperCase())}</text>`;
}

function statementSvg(view) {
  return `
  <rect width="100%" height="100%" fill="#e8eef4"/>
  <rect x="48" y="40" width="1104" height="820" rx="44" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="48" y="40" width="1104" height="240" rx="44" fill="#f8fafc"/>
  <rect x="48" y="200" width="1104" height="80" fill="#f8fafc"/>
  <line x1="48" y1="280" x2="1152" y2="280" stroke="#e2e8f0" stroke-width="2"/>
  <text x="92" y="120" font-family="Geist" font-size="22" letter-spacing="4" fill="#94a3b8">${xml(view.kicker)}</text>
  <text x="92" y="188" font-family="Geist" font-size="48" font-weight="700" fill="#0f172a">${xml(view.shop)}</text>
  ${view.details ? `<text x="92" y="240" font-family="Geist" font-size="22" fill="#64748b">${xml(view.details)}</text>` : ""}
  ${headerLogo(view, 1028, 92, 88, "#1e293b", "#ffffff")}
  <text x="92" y="360" font-family="Geist" font-size="20" letter-spacing="2" fill="#94a3b8">BILLED TO</text>
  <text x="92" y="418" font-family="Geist" font-size="38" font-weight="700" fill="#0f172a">${xml(view.customerName)}</text>
  <rect x="92" y="460" width="1016" height="120" rx="22" fill="#1e293b"/>
  <text x="124" y="532" font-family="Geist" font-size="24" fill="#ffffff">${xml(view.note)}</text>
  <text x="1076" y="532" text-anchor="end" font-family="Geist" font-size="24" fill="#ffffff">${xml(view.dueAmount)}</text>
  <text x="92" y="680" font-family="Geist" font-size="24" fill="#94a3b8">${xml(view.totalLabel)}</text>
  <text x="1108" y="690" text-anchor="end" font-family="Geist" font-size="60" font-weight="700" fill="#0f172a">${xml(view.amount)}</text>
  ${brandLine(92, 800, "#94a3b8")}`;
}

function publicShareSvg(snapshot) {
  const view = ogView(snapshot);
  let body = invoiceSvg(view);
  if (isPublicStatement(snapshot) || view.style === "statement") {
    body = statementSvg(view);
  } else if (view.style === "minimal") {
    body = minimalSvg(view);
  } else if (view.style === "colorful") {
    body = colorfulSvg(view);
  } else if (view.style === "ticket") {
    body = ticketSvg(view);
  } else if (view.style === "receipt") {
    body = receiptSvg(view);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${OG_SIZE.width}" height="${OG_SIZE.height}" viewBox="0 0 ${OG_SIZE.width} ${OG_SIZE.height}" xmlns="http://www.w3.org/2000/svg">
  ${body}
</svg>`;
}

export function sampleOgBillSnapshot(themeId = "classic") {
  return {
    entry: {
      id: "ent_ogpreview",
      type: "invoice",
      amount: 2000,
      due: 500,
      date: "2026-08-21T11:26:00.000Z",
      description: "Makeup and Haircut and Mehandi",
    },
    customer: {
      name: "Nisha Sarma",
      phone: "9876543210",
    },
    business: {
      name: "Glam Studio",
      phone: "0141 234 5678",
      address: "Jaipur",
    },
    themeId,
  };
}

export async function renderPublicBillOgPng(snapshot) {
  const { Resvg } = await import("@resvg/resvg-js");
  const fontFile = geistFontPath();
  const options = {
    fitTo: { mode: "width", value: OG_SIZE.width },
    font: {
      fontFiles: [fontFile],
      loadSystemFonts: false,
      defaultFontFamily: "Geist",
    },
  };
  try {
    return new Resvg(publicShareSvg(snapshot), options).render().asPng();
  } catch {
    const fallback = snapshot
      ? {
          ...snapshot,
          business: { ...snapshot.business, logo: "" },
        }
      : snapshot;
    return new Resvg(publicShareSvg(fallback), options).render().asPng();
  }
}

export async function renderPublicBillOgImage(snapshot) {
  const png = await renderPublicBillOgPng(snapshot);
  return new Response(png, {
    headers: {
      "Content-Type": OG_CONTENT_TYPE,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
