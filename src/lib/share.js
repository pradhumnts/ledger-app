import { formatINR, formatEntryDate, entryTypeLabel } from "@/lib/format";
import { APP_NAME, APP_SITE_URL, SUPPORT_WHATSAPP } from "@/lib/branding";
import { capture } from "@/lib/analytics";
import { normalizeLanguage, translate } from "@/lib/i18n";
import { collectableRupees } from "@/lib/ledger-math";
import { buildPublicBillUrl } from "@/lib/public-bill-url";
import { buildUpiPaymentUrl } from "@/lib/upi";

function payAmountForEntry(entry) {
  if (!entry) return undefined;
  const due = Number(entry.due);
  if (Number.isFinite(due) && due > 0) return due;
  if (entry.type === "got") return undefined;
  const amount = Number(entry.amount);
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

function waBold(text) {
  return `*${String(text || "").replace(/^\*|\*$/g, "")}*`;
}

function emphasize(text, plain) {
  return plain ? String(text || "") : waBold(text);
}

function withPayLink(lines, { business, amount, language, plain }) {
  if (plain) return lines;
  const href = buildUpiPaymentUrl({
    upiId: business?.upiId,
    name: business?.name,
    amount,
  });
  if (!href) return lines;
  return [
    ...lines,
    "",
    waBold(translate(language, "share.payNow")),
    href,
  ];
}

function businessLine(business) {
  if (!business?.name) return "";
  const bits = [business.name];
  if (business.phone) bits.push(business.phone);
  return bits.join(" · ");
}

export async function buildEntryMessage({
  entry,
  customer,
  business,
  language = "en",
  themeId,
  format = "whatsapp",
}) {
  const lang = normalizeLanguage(language);
  const plain = format === "sms";
  const typeLabel = entryTypeLabel(entry.type, lang);
  const billUrl = await buildPublicBillUrl({
    entry,
    customer,
    business,
    themeId,
  });

  const lines = [
    businessLine(business, lang),
    "",
    `${
      entry.type === "got"
        ? translate(lang, "entry.paid")
        : typeLabel
    }: ${formatINR(entry.amount)}`,
    Number(entry.due) > 0 &&
    (entry.type === "got" ||
      (entry.type === "invoice" && Number(entry.due) !== Number(entry.amount)))
      ? `${translate(lang, "entry.due")}: ${formatINR(entry.due)}`
      : "",
    translate(lang, "share.entryDate", {
      date: formatEntryDate(entry.date, lang),
    }),
  ];

  const withLink = withPayLink(
    [
      ...lines.filter(Boolean),
      "",
      emphasize(translate(lang, "share.viewOnline"), plain),
      billUrl,
    ],
    { business, amount: payAmountForEntry(entry), language: lang, plain }
  );

  return [
    ...withLink,
    "",
    emphasize(translate(lang, "common.sentViaMoneyKit"), plain),
  ].join("\n");
}

export async function buildCustomerStatementMessage({
  customer,
  entries,
  balance,
  billed,
  business,
  language = "en",
  themeId,
  format = "whatsapp",
}) {
  const lang = normalizeLanguage(language);
  const plain = format === "sms";
  const suffix =
    balance > 0
      ? translate(lang, "share.toCollectSuffix")
      : balance < 0
        ? translate(lang, "share.toPaySuffix")
        : "";

  const billUrl = await buildPublicBillUrl({
    kind: "statement",
    customer,
    entries,
    balance,
    billed,
    business,
    themeId,
  });

  const lines = [
    businessLine(business, lang),
    "",
    translate(lang, "share.balance", {
      amount: formatINR(Math.abs(balance)),
      suffix,
    }),
    "",
  ];

  const recent = [...entries]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);

  recent.forEach((entry) => {
    const label =
      entry.type === "due" || entry.type === "gave"
        ? translate(lang, "entry.due")
        : entry.type === "got"
          ? translate(lang, "entry.payment")
          : translate(lang, "entry.bill");
    const dueBit =
      Number(entry.due) > 0 &&
      (entry.type === "got" ||
        (entry.type === "invoice" && Number(entry.due) !== Number(entry.amount)))
        ? ` · ${translate(lang, "entry.due")} ${formatINR(entry.due)}`
        : "";
    lines.push(
      `${formatEntryDate(entry.date, lang)} · ${label} ${formatINR(entry.amount)}${dueBit}`
    );
  });

  const withLink = withPayLink(
    [
      ...lines.filter(Boolean),
      "",
      emphasize(translate(lang, "share.viewOnline"), plain),
      billUrl,
    ],
    {
      business,
      amount: collectableRupees(balance),
      language: lang,
      plain,
    }
  );

  return [
    ...withLink,
    "",
    emphasize(translate(lang, "common.sentViaMoneyKit"), plain),
  ].join("\n");
}

function toWhatsAppPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

export function telHref(phone) {
  const withCountry = toWhatsAppPhone(phone);
  return withCountry ? `tel:+${withCountry}` : "";
}

function openExternalUrl(url) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.referrerPolicy = "no-referrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function openWhatsApp({ phone, text }) {
  const withCountry = toWhatsAppPhone(phone);
  const url = withCountry
    ? `https://wa.me/${withCountry}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;

  // `window.open(..., "noopener")` returns null, so the old null-check
  // fallback always also set location.href — WhatsApp opened, and this
  // tab went to a blank wa.me page. New-tab only keeps the app in place.
  openExternalUrl(url);
}

/**
 * Opens the customer's WhatsApp chat with the message prefilled.
 * Chat links cannot attach files, so a PDF is only offered through the
 * system share sheet when we do not have a phone number.
 */
export async function shareOnWhatsApp({ phone, text, file, title }) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits) {
    openWhatsApp({ phone, text });
    return;
  }

  if (file) {
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title || APP_NAME,
          text,
        });
        return;
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }

  openWhatsApp({ phone, text });
}

export function openSMS({ phone, text }) {
  const digits = String(phone || "").replace(/\D/g, "");
  const body = encodeURIComponent(text);
  const url = digits
    ? `sms:${digits}?&body=${body}`
    : `sms:?&body=${body}`;
  window.location.href = url;
}

export function getAppUrl() {
  return APP_SITE_URL;
}

export function getAppShareContent(language = "en") {
  const lang = normalizeLanguage(language);
  const url = getAppUrl();
  const text = translate(lang, "share.appText");
  return {
    title: APP_NAME,
    text,
    url,
    full: `${text}${url ? `\n${url}` : ""}`.trim(),
  };
}

export function shareApp(language = "en") {
  const { title, text, url, full } = getAppShareContent(language);

  if (navigator.share) {
    navigator.share({ title, text, url }).catch(() => {});
    return;
  }

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(full);
  }
}

export function shareAppViaWhatsApp(language = "en") {
  const { full } = getAppShareContent(language);
  openWhatsApp({ text: full });
}

export function shareAppViaSMS(language = "en") {
  const { full } = getAppShareContent(language);
  openSMS({ text: full });
}

export function requestCustomTheme({ kind, businessName = "", language = "en" }) {
  const lang = normalizeLanguage(language);
  const label =
    kind === "qr"
      ? translate(lang, "share.themeRequestQr")
      : translate(lang, "share.themeRequestBill");
  const business = businessName.trim()
    ? `\n${translate(lang, "share.businessLine", { name: businessName.trim() })}`
    : "";
  const text = translate(lang, "share.themeRequestBody", {
    business,
    kind: label,
  });
  openWhatsApp({ phone: SUPPORT_WHATSAPP, text });
  capture("theme_requested", { kind });
}

export function requestWebsitePlan({
  planId,
  planTitle,
  price,
  businessName = "",
  language = "en",
}) {
  const lang = normalizeLanguage(language);
  const business = businessName.trim()
    ? `\n${translate(lang, "share.businessLine", { name: businessName.trim() })}`
    : "";
  const text = translate(lang, "share.websitePlanBody", {
    business,
    plan: planTitle,
    price: formatINR(price),
  });
  openWhatsApp({ phone: SUPPORT_WHATSAPP, text });
}
