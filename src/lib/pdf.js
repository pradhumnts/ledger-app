import { getBillTheme } from "@/lib/bill-themes";
import { APP_NAME } from "@/lib/branding";
import {
  formatBillNumber,
  formatEntryDate,
  formatEntryDateTime,
} from "@/lib/format";
import { getAppUrl } from "@/lib/share";

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

function resolveTheme(billThemeId) {
  return getBillTheme(billThemeId).pdf;
}

function rupees(amount) {
  const value = Math.abs(Number(amount) || 0);
  return `Rs. ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
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
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  return { jsPDF, autoTable: autoTableModule.default };
}

function drawMark(doc, x, y, size = 8, colors = resolveTheme()) {
  doc.setFillColor(...(colors.markBg || colors.lime || LIME));
  doc.roundedRect(x, y, size, size, 1.6, 1.6, "F");
  doc.setTextColor(...(colors.markText || colors.forest || FOREST));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size * 1.15);
  doc.text("M", x + size / 2, y + size * 0.72, { align: "center" });
}

function drawFooter(doc, url, colors = resolveTheme()) {
  const y = PAGE.h - 18;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE.w - MARGIN, y);

  drawMark(doc, MARGIN, y + 3.2, 6.5, colors);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...(colors.forest || FOREST));
  const brand = `Made with ${APP_NAME}`;
  if (url) {
    doc.textWithLink(brand, MARGIN + 9, y + 7.6, { url });
    const brandWidth = doc.getTextWidth(brand);
    doc.setDrawColor(...(colors.lime || LIME));
    doc.setLineWidth(0.6);
    doc.line(MARGIN + 9, y + 8.6, MARGIN + 9 + brandWidth, y + 8.6);
    doc.link(MARGIN, y + 2, 78, 12, { url });
  } else {
    doc.text(brand, MARGIN + 9, y + 7.6);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text("Simple billing for India", MARGIN + 9, y + 11.4);

  const link = String(url || "").replace(/^https?:\/\//, "");
  if (link) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...(colors.forest || FOREST));
    doc.textWithLink(link, PAGE.w - MARGIN, y + 8.2, {
      url,
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

function drawCoverHeader(doc, { kicker, business, url, billNo, colors }) {
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

  drawMark(doc, MARGIN, 8, 7.2, theme);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...(theme.lime || LIME));
  if (url) {
    doc.textWithLink("LEDGER", MARGIN + 10, 13.2, { url });
    doc.link(MARGIN, 7, 34, 9, { url });
  } else {
    doc.text("LEDGER", MARGIN + 10, 13.2);
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

function toPdfFile(doc, filename) {
  return new File([doc.output("blob")], filename, { type: "application/pdf" });
}

async function saveOrShare(doc, filename, title) {
  const file = toPdfFile(doc, filename);

  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title, text: title });
      return;
    }
  } catch (error) {
    if (error?.name === "AbortError") return;
  }

  doc.save(filename);
}

export async function exportCustomerStatementPdf(args) {
  const { doc, filename, title } = await buildCustomerStatementPdf(args);
  await saveOrShare(doc, filename, title);
}

export async function buildCustomerStatementPdf({
  customer,
  entries,
  balance,
  totals,
  business,
  billThemeId,
}) {
  const { jsPDF, autoTable } = await loadPdf();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const url = getAppUrl();
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
    subject: `Customer khata statement from ${APP_NAME}`,
    author: business?.name || APP_NAME,
    creator: APP_NAME,
  });

  let y = drawCoverHeader(doc, {
    kicker: "STATEMENT",
    business,
    url,
    billNo,
    colors,
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
    { label: "Due", value: rupees(Math.max(0, totals?.due ?? balance)), color: MINT },
    {
      label: balanceCopy(balance),
      value: rupees(balance),
      color: balance > 0 ? MINT : INK,
    },
  ]);

  const body = list.map((entry) => {
    const note = entry.description ? `\n${entry.description}` : "";
    return [
      formatEntryDate(entry.date, PDF_LANG),
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
      drawFooter(doc, url, colors);
    },
  });

  const filename = `${safeFilename(customer?.name)}-${billNo}.pdf`;
  const title = `Statement for ${customer?.name || "customer"}`;
  return {
    doc,
    filename,
    title,
    file: toPdfFile(doc, filename),
  };
}

export async function exportEntryPdf(args) {
  const { doc, filename, title } = await buildEntryPdf(args);
  await saveOrShare(doc, filename, title);
}

export async function buildEntryPdf({ entry, customer, business, billThemeId }) {
  const { jsPDF } = await loadPdf();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const url = getAppUrl();
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
    ["Date", formatEntryDateTime(entry?.date, PDF_LANG)],
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

  drawFooter(doc, url, colors);

  const filename = `${safeFilename(customer?.name)}-${billNo}.pdf`;
  const title = `${label} for ${customer?.name || "customer"}`;
  return {
    doc,
    filename,
    title,
    file: toPdfFile(doc, filename),
  };
}
