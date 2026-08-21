import { getBillTheme } from "@/lib/bill-themes";
import {
  APP_ICON_192,
  APP_LOGO_WEBP,
  APP_NAME,
  APP_SITE_URL,
  APP_TAGLINE,
} from "@/lib/branding";
import {
  formatBillNumber,
  formatEntryDate,
  formatEntryDateTime,
  resolveEntryWhen,
} from "@/lib/format";
import { collectableRupees } from "@/lib/ledger-math";
import { paiseToRupees, rupeesToPaise } from "@/lib/supabase/money";
import { normalizeLanguage, translate } from "@/lib/i18n";
import { buildPublicBillUrl } from "@/lib/public-bill-url";
import { STORAGE_KEY } from "@/lib/store";

/** Bills / PDFs always use English — Helvetica can't render Hindi glyphs reliably. */
const PDF_LANG = "en";

const FOREST = [11, 48, 31];
const LIME = [200, 232, 106];
const MINT = [31, 138, 76];
const INK = [24, 24, 27];
const MUTED = [113, 113, 122];
const PAPER = [244, 245, 243];
const LINE = [232, 234, 230];
const WHITE = [255, 255, 255];

const PAGE = { w: 210, h: 297 };
const MARGIN = 16;
const BRAND_MARK = APP_NAME.toUpperCase();

let logoPngPromise;
let pdfLibPromise;
const preparedPdfs = new Map();

async function loadBrandLogoPng() {
  if (!logoPngPromise) logoPngPromise = fetchBrandLogoPng();
  return logoPngPromise;
}

async function fetchBrandLogoPng() {
  const sources = [APP_LOGO_WEBP, APP_ICON_192];
  for (const src of sources) {
    try {
      const res = await fetch(src);
      if (!res.ok) continue;
      const blob = await res.blob();
      if (blob.type === "image/png" || src.endsWith(".png")) {
        const dataUrl = await blobToDataUrl(blob);
        if (dataUrl) return dataUrl;
        continue;
      }
      const bitmap = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      const size = 192;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0, size, size);
      bitmap.close?.();
      return canvas.toDataURL("image/png");
    } catch {
      continue;
    }
  }
  return null;
}

export function prefetchPdfEngine() {
  loadPdf();
  loadBrandLogoPng();
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function resolveTheme(billThemeId) {
  return getBillTheme(billThemeId).pdf;
}

function rupees(amount) {
  const value = Math.abs(paiseToRupees(rupeesToPaise(amount)));
  return `Rs. ${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)}`;
}

function typeLabel(type) {
  if (type === "due" || type === "gave") return "Due";
  if (type === "got") return "Payment";
  return "Bill";
}

function balanceCopy(balance) {
  if (balance > 0) return "To collect";
  if (balance < 0) return "To pay";
  return "Settled";
}

function safeFilename(name) {
  return (
    String(name || "moneykit")
      .trim()
      .replace(/[^\w]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "moneykit"
  );
}

function todayLabel() {
  return new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function loadPdf() {
  if (!pdfLibPromise) {
    pdfLibPromise = Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]).then(([{ jsPDF }, autoTableModule]) => ({
      jsPDF,
      autoTable: autoTableModule.default,
    }));
  }
  return pdfLibPromise;
}

function drawMark(doc, x, y, size = 8, colors = resolveTheme(), logoDataUrl = null) {
  if (logoDataUrl) {
    doc.setFillColor(...WHITE);
    doc.roundedRect(x, y, size, size, 1.6, 1.6, "F");
    const pad = size * 0.08;
    try {
      doc.addImage(
        logoDataUrl,
        "PNG",
        x + pad,
        y + pad,
        size - pad * 2,
        size - pad * 2
      );
      return;
    } catch {
      // Fall through to the letter mark.
    }
  }

  doc.setFillColor(...(colors.markBg || colors.lime || LIME));
  doc.roundedRect(x, y, size, size, 1.6, 1.6, "F");
  doc.setTextColor(...(colors.markText || colors.forest || FOREST));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size * 1.15);
  doc.text("M", x + size / 2, y + size * 0.72, { align: "center" });
}

function drawFooter(doc, url, colors = resolveTheme(), logoDataUrl = null) {
  const y = PAGE.h - 18;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE.w - MARGIN, y);

  drawMark(doc, MARGIN, y + 3.2, 6.5, colors, logoDataUrl);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...(colors.forest || FOREST));
  const brand = `Created with ${APP_NAME}`;
  const brandUrl = APP_SITE_URL;
  if (brandUrl) {
    doc.textWithLink(brand, MARGIN + 9, y + 7.6, { url: brandUrl });
    const brandWidth = doc.getTextWidth(brand);
    doc.setDrawColor(...(colors.lime || LIME));
    doc.setLineWidth(0.6);
    doc.line(MARGIN + 9, y + 8.6, MARGIN + 9 + brandWidth, y + 8.6);
    doc.link(MARGIN, y + 2, 78, 12, { url: brandUrl });
  } else {
    doc.text(brand, MARGIN + 9, y + 7.6);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(APP_TAGLINE, MARGIN + 9, y + 11.4);

  const link = String(url || brandUrl || "").replace(/^https?:\/\//, "");
  if (url && url !== APP_SITE_URL) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...(colors.forest || FOREST));
    doc.textWithLink("View this bill online", PAGE.w - MARGIN, y + 8.2, {
      url,
      align: "right",
    });
  } else if (link) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...(colors.forest || FOREST));
    doc.textWithLink(link, PAGE.w - MARGIN, y + 8.2, {
      url: url || brandUrl,
      align: "right",
    });
  }

  const page = doc.getNumberOfPages();
  if (page > 1) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.setFontSize(8);
    doc.text(`Page ${page}`, PAGE.w / 2, PAGE.h - 8, { align: "center" });
  }
}

function createBillNumber(kind = "bill", seed = "") {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const suffix = String(seed || Math.random().toString(36))
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-6)
    .toUpperCase()
    .padStart(6, "X");
  const prefix = kind === "statement" ? "ST" : "BL";
  return `${prefix}-${yy}${mm}${dd}-${suffix}`;
}

function drawCoverHeader(doc, { kicker, business, url, billNo, colors, logoDataUrl }) {
  const theme = colors || resolveTheme();
  const phone = String(business?.phone || "").trim();
  const address = String(business?.address || "").trim();
  const details = [phone, address].filter(Boolean).join("  ·  ");
  const businessName = business?.name?.trim() || "Your business";

  const nameWidth = PAGE.w - MARGIN * 2 - 58;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  const nameLines = doc.splitTextToSize(businessName, nameWidth).slice(0, 2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const detailLines = details
    ? doc.splitTextToSize(details, nameWidth).slice(0, 2)
    : [];

  const bannerH =
    28 +
    nameLines.length * 7.2 +
    (detailLines.length ? 4 + detailLines.length * 4.6 : 0) +
    8;

  doc.setFillColor(...(theme.forest || FOREST));
  doc.rect(0, 0, PAGE.w, bannerH, "F");

  drawMark(doc, MARGIN, 8, 7.2, theme, logoDataUrl);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...(theme.lime || LIME));
  if (url) {
    doc.textWithLink(BRAND_MARK, MARGIN + 10, 13.2, { url });
    const brandW = doc.getTextWidth(BRAND_MARK);
    doc.link(MARGIN, 7, 10 + brandW, 9, { url });
  } else {
    doc.text(BRAND_MARK, MARGIN + 10, 13.2);
  }

  doc.setFontSize(7.5);
  doc.setTextColor(...(theme.lime || LIME));
  doc.text(kicker, PAGE.w - MARGIN, 11.2, { align: "right" });

  if (billNo) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...(theme.detail || [210, 220, 208]));
    doc.text("BILL NO.", PAGE.w - MARGIN, 16.6, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...WHITE);
    doc.text(billNo, PAGE.w - MARGIN, 21.4, { align: "right" });
  }

  let y = 32;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...WHITE);
  doc.text(nameLines, MARGIN, y);
  y += nameLines.length * 7.2;

  if (detailLines.length) {
    y += 2.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...(theme.detail || [196, 214, 190]));
    doc.text(detailLines, MARGIN, y);
  }

  return bannerH + 10;
}

function drawSummaryTiles(doc, y, tiles) {
  const gap = 4;
  const width = (PAGE.w - MARGIN * 2 - gap * (tiles.length - 1)) / tiles.length;
  const height = 22;

  tiles.forEach((tile, index) => {
    const x = MARGIN + index * (width + gap);
    doc.setFillColor(...PAPER);
    doc.roundedRect(x, y, width, height, 3, 3, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(tile.label.toUpperCase(), x + 4, y + 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...(tile.color || INK));
    doc.text(tile.value, x + 4, y + 16);
  });

  return y + height;
}

function toPdfFile(doc, filename, type = "application/pdf") {
  return new File([doc.output("arraybuffer")], filename, {
    type,
    lastModified: Date.now(),
  });
}

function shareCopy(key) {
  let language = "en";
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    language = parsed?.settings?.language || "en";
  } catch {
    // Keep English.
  }
  return translate(normalizeLanguage(language), key);
}

function isMobileShareDevice() {
  if (typeof navigator === "undefined") return false;
  return (
    navigator.maxTouchPoints > 0 ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  );
}

function isShareCancel(error) {
  return error?.name === "AbortError";
}

async function tryNativeShare(payload) {
  if (typeof navigator.share !== "function") return "unsupported";
  try {
    await navigator.share(payload);
    return "shared";
  } catch (error) {
    if (isShareCancel(error)) return "cancelled";
    if (error?.name === "NotAllowedError") return "no-gesture";
    return "failed";
  }
}

function pdfSharePayloads(doc, filename, title, url) {
  const buffer = doc.output("arraybuffer");
  const files = [
    new File([buffer], filename, {
      type: "application/pdf",
      lastModified: Date.now(),
    }),
    new File([buffer], filename, {
      type: "application/octet-stream",
      lastModified: Date.now(),
    }),
  ];
  return [
    ...files.map((file) => ({ files: [file], title, text: title })),
    {
      title,
      text: url ? `${title}\n${url}` : title,
      ...(url ? { url } : {}),
    },
  ];
}

async function sharePdfPayloads(payloads) {
  let sawNoGesture = false;
  for (const payload of payloads) {
    const result = await tryNativeShare(payload);
    if (result === "shared" || result === "cancelled") return result;
    if (result === "no-gesture") sawNoGesture = true;
  }
  return sawNoGesture ? "no-gesture" : "failed";
}

function promptPdfShare(payloads) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:80;display:flex;align-items:flex-end;justify-content:center;background:rgba(11,48,31,.45);padding:20px 20px calc(20px + env(safe-area-inset-bottom));";

    const sheet = document.createElement("div");
    sheet.style.cssText =
      "width:min(28rem,100%);border-radius:1.5rem;background:var(--app-bg,#fff);padding:1.25rem;box-shadow:0 24px 50px rgba(11,48,31,.18);";

    const hint = document.createElement("p");
    hint.textContent = shareCopy("share.pdfReady");
    hint.style.cssText =
      "margin:0 0 1rem;font-size:.95rem;font-weight:600;color:#18181b;";

    const shareBtn = document.createElement("button");
    shareBtn.type = "button";
    shareBtn.textContent = shareCopy("share.sharePdf");
    shareBtn.style.cssText =
      "width:100%;height:3rem;border:0;border-radius:999px;background:var(--forest,#0b301f);color:#fff;font-weight:600;font-size:.9rem;";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.textContent = shareCopy("common.cancel");
    cancelBtn.style.cssText =
      "width:100%;margin-top:.55rem;height:2.75rem;border:0;border-radius:999px;background:transparent;color:#71717a;font-weight:600;font-size:.875rem;";

    const finish = (value) => {
      overlay.remove();
      resolve(value);
    };

    shareBtn.addEventListener("click", async () => {
      shareBtn.disabled = true;
      const result = await sharePdfPayloads(payloads);
      if (result === "shared" || result === "cancelled") {
        finish(result);
        return;
      }
      shareBtn.disabled = false;
    });
    cancelBtn.addEventListener("click", () => finish("cancelled"));
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) finish("cancelled");
    });

    sheet.append(hint, shareBtn, cancelBtn);
    overlay.append(sheet);
    document.body.append(overlay);
  });
}

async function saveOrShare(doc, filename, title, url) {
  const payloads = pdfSharePayloads(doc, filename, title, url);

  if (typeof navigator.share === "function") {
    const result = await sharePdfPayloads(payloads);
    if (result === "shared" || result === "cancelled") return;
    if (isMobileShareDevice()) {
      await promptPdfShare(payloads);
      return;
    }
  }

  doc.save(filename);
}

function rememberPrepared(key, promise) {
  preparedPdfs.set(
    key,
    promise.catch((error) => {
      preparedPdfs.delete(key);
      throw error;
    })
  );
  return preparedPdfs.get(key);
}

export function prefetchEntryPdf(args) {
  prefetchPdfEngine();
  const key = `entry:${args.entry?.id}:${args.entry?.amount}:${args.entry?.due}:${args.billThemeId}`;
  if (!preparedPdfs.has(key)) {
    rememberPrepared(key, buildEntryPdf(args));
  }
  return preparedPdfs.get(key);
}

export function prefetchCustomerStatementPdf(args) {
  prefetchPdfEngine();
  const key = `statement:${args.customer?.id}:${args.entries?.length}:${args.balance}:${args.billThemeId}`;
  if (!preparedPdfs.has(key)) {
    rememberPrepared(key, buildCustomerStatementPdf(args));
  }
  return preparedPdfs.get(key);
}

export async function exportCustomerStatementPdf(args) {
  const { doc, filename, title, url } = await prefetchCustomerStatementPdf(args);
  await saveOrShare(doc, filename, title, url);
}

export async function buildCustomerStatementPdf({
  customer,
  entries,
  balance,
  totals,
  business,
  billThemeId,
}) {
  const [{ jsPDF, autoTable }, logoDataUrl] = await Promise.all([
    loadPdf(),
    loadBrandLogoPng(),
  ]);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const url = await buildPublicBillUrl({
    kind: "statement",
    customer,
    entries,
    balance,
    billed: totals?.billed,
    business,
    themeId: billThemeId,
  });
  const billNo = createBillNumber(
    "statement",
    `${customer?.id || "cust"}-${entries?.length || 0}-${customer?.name || ""}`
  );
  const colors = resolveTheme(billThemeId);
  const list = [...(entries || [])].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  doc.setProperties({
    title: `Statement ${billNo} — ${customer?.name || "Customer"}`,
    subject: `Customer statement from ${APP_NAME}`,
    author: business?.name || APP_NAME,
    creator: APP_NAME,
  });

  let y = drawCoverHeader(doc, {
    kicker: "STATEMENT",
    business,
    url,
    billNo,
    colors,
    logoDataUrl,
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("PREPARED FOR", MARGIN, y);
  doc.text(`Generated ${todayLabel()}`, PAGE.w - MARGIN, y, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...INK);
  doc.text(customer?.name || "Customer", MARGIN, y + 7);

  if (customer?.phone) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(String(customer.phone), MARGIN, y + 13);
    y += 20;
  } else {
    y += 14;
  }

  y = drawSummaryTiles(doc, y, [
    { label: "Billed", value: rupees(totals?.billed) },
    { label: "Due", value: rupees(collectableRupees(totals?.due ?? balance)), color: MINT },
    {
      label: balanceCopy(balance),
      value: rupees(balance),
      color: balance > 0 ? MINT : INK,
    },
  ]);

  const body = list.map((entry) => {
    const note = entry.description ? `\n${entry.description}` : "";
    return [
      formatEntryDate(resolveEntryWhen(entry), PDF_LANG),
      `${typeLabel(entry.type)}${note}`,
      rupees(entry.amount),
    ];
  });

  autoTable(doc, {
    startY: y + 8,
    head: [["Date", "Particulars", "Amount"]],
    body: body.length
      ? body
      : [["—", "No entries yet", rupees(0)]],
    foot: [
      [
        "",
        `Balance · ${balanceCopy(balance)}`,
        rupees(balance),
      ],
    ],
    theme: "plain",
    margin: { left: MARGIN, right: MARGIN, bottom: 28 },
    styles: {
      font: "helvetica",
      fontSize: 9,
      textColor: INK,
      cellPadding: { top: 3.2, bottom: 3.2, left: 2.5, right: 2.5 },
      overflow: "linebreak",
      valign: "top",
    },
    headStyles: {
      fillColor: colors.forest || FOREST,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: { top: 3.6, bottom: 3.6, left: 2.5, right: 2.5 },
    },
    footStyles: {
      fillColor: PAPER,
      textColor: INK,
      fontStyle: "bold",
      fontSize: 10,
    },
    alternateRowStyles: { fillColor: [250, 251, 249] },
    columnStyles: {
      0: { cellWidth: 36, textColor: MUTED },
      2: { cellWidth: 38, halign: "right", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section !== "body" || data.column.index !== 2) return;
      const entry = list[data.row.index];
      if (entry?.type === "got") data.cell.styles.textColor = MINT;
    },
    didDrawPage: () => {
      drawFooter(doc, url, colors, logoDataUrl);
    },
  });

  const filename = `${safeFilename(customer?.name)}-${billNo}.pdf`;
  const title = `Statement for ${customer?.name || "customer"}`;
  return {
    doc,
    filename,
    title,
    url,
    file: toPdfFile(doc, filename),
  };
}

export async function exportEntryPdf(args) {
  const { doc, filename, title, url } = await prefetchEntryPdf(args);
  await saveOrShare(doc, filename, title, url);
}

export async function buildEntryPdf({ entry, customer, business, billThemeId }) {
  const [{ jsPDF }, logoDataUrl] = await Promise.all([
    loadPdf(),
    loadBrandLogoPng(),
  ]);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const url = await buildPublicBillUrl({
    entry,
    customer,
    business,
    themeId: billThemeId,
  });
  const billNo = formatBillNumber(entry);
  const label = typeLabel(entry?.type);
  const colors = resolveTheme(billThemeId);

  doc.setProperties({
    title: `${label} ${billNo} — ${customer?.name || "Customer"}`,
    subject: `Transaction receipt from ${APP_NAME}`,
    author: business?.name || APP_NAME,
    creator: APP_NAME,
  });

  let y = drawCoverHeader(doc, {
    kicker: "RECEIPT",
    business,
    url,
    billNo,
    colors,
    logoDataUrl,
  });

  const noteWidth = PAGE.w - MARGIN * 2 - 40;
  const noteLines = entry?.description
    ? doc.splitTextToSize(String(entry.description), noteWidth)
    : [];
  const boxHeight = 116 + (noteLines.length ? noteLines.length * 5 + 6 : 0);

  doc.setFillColor(...PAPER);
  doc.roundedRect(MARGIN, y, PAGE.w - MARGIN * 2, boxHeight, 5, 5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(label.toUpperCase(), MARGIN + 8, y + 12);

  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(customer?.name || "Customer", MARGIN + 8, y + 22);

  if (customer?.phone) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    doc.text(String(customer.phone), MARGIN + 8, y + 28);
  }

  const amountColor = entry?.type === "got" ? MINT : colors.forest || FOREST;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...amountColor);
  doc.text(rupees(entry?.amount), MARGIN + 8, y + 48);

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.35);
  doc.line(MARGIN + 8, y + 56, PAGE.w - MARGIN - 8, y + 56);

  const amountLabel = entry?.type === "got" ? "Paid" : "Amount";
  const rows = [
    ["Bill no.", billNo],
    ["Date", formatEntryDateTime(resolveEntryWhen(entry), PDF_LANG)],
    ["Type", label],
    [amountLabel, rupees(entry?.amount)],
  ];
  if (
    Number(entry?.due) > 0 &&
    (entry?.type === "got" ||
      (entry?.type === "invoice" && Number(entry.due) !== Number(entry.amount)))
  ) {
    rows.push(["Due", rupees(entry.due)]);
  }
  if (entry?.description) rows.push(["Note", entry.description]);

  let rowY = y + 66;
  rows.forEach(([key, value]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(key.toUpperCase(), MARGIN + 8, rowY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    const lines = doc.splitTextToSize(String(value), PAGE.w - MARGIN * 2 - 40);
    doc.text(lines, MARGIN + 36, rowY);
    rowY += Math.max(8, lines.length * 5 + 3);
  });

  drawFooter(doc, url, colors, logoDataUrl);

  const filename = `${safeFilename(customer?.name)}-${billNo}.pdf`;
  const title = `${label} for ${customer?.name || "customer"}`;
  return {
    doc,
    filename,
    title,
    url,
    file: toPdfFile(doc, filename),
  };
}
