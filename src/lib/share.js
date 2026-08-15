import { formatINR, formatEntryDate, entryTypeLabel } from "@/lib/format";
import { APP_NAME } from "@/lib/branding";
import { normalizeLanguage, translate } from "@/lib/i18n";

function businessLine(business, language) {
  if (!business?.name) return "";
  const bits = [business.name];
  if (business.phone) bits.push(business.phone);
  return bits.join(" · ");
}

export function buildEntryMessage({ entry, customer, business, language = "en" }) {
  const lang = normalizeLanguage(language);
  const typeLabel = entryTypeLabel(entry.type, lang);

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
    translate(lang, "share.entryCustomer", { name: customer?.name || "—" }),
    translate(lang, "share.entryDate", {
      date: formatEntryDate(entry.date, lang),
    }),
  ];

  if (entry.description) {
    lines.push(
      translate(lang, "share.entryNote", { note: entry.description })
    );
  }

  lines.push("", translate(lang, "common.sentViaMoneyKit"));
  return lines.filter(Boolean).join("\n");
}

export function buildCustomerStatementMessage({
  customer,
  entries,
  balance,
  business,
  language = "en",
}) {
  const lang = normalizeLanguage(language);
  const suffix =
    balance > 0
      ? translate(lang, "share.toCollectSuffix")
      : balance < 0
        ? translate(lang, "share.toPaySuffix")
        : "";

  const lines = [
    businessLine(business, lang),
    "",
    translate(lang, "share.statementFor", {
      name: customer?.name || translate(lang, "common.customer"),
    }),
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
    const note = entry.description ? ` — ${entry.description}` : "";
    const dueBit =
      Number(entry.due) > 0 &&
      (entry.type === "got" ||
        (entry.type === "invoice" && Number(entry.due) !== Number(entry.amount)))
        ? ` · ${translate(lang, "entry.due")} ${formatINR(entry.due)}`
        : "";
    lines.push(
      `${formatEntryDate(entry.date, lang)} · ${label} ${formatINR(entry.amount)}${dueBit}${note}`
    );
  });

  lines.push("", translate(lang, "common.sentViaMoneyKit"));
  return lines.filter(Boolean).join("\n");
}

function toWhatsAppPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

export function openWhatsApp({ phone, text }) {
  const withCountry = toWhatsAppPhone(phone);
  const url = withCountry
    ? `https://wa.me/${withCountry}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;

  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.href = url;
  }
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
  if (typeof window === "undefined") return "";
  return window.location.origin;
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
  openWhatsApp({ text });
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
  openWhatsApp({ text });
}
