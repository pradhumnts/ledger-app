import { formatINR } from "@/lib/format";
import { normalizeLanguage, translate } from "@/lib/i18n";
import { POSTER_HEIGHT, POSTER_WIDTH } from "@/lib/qr-theme-styles";
import { openWhatsApp } from "@/lib/share";

export function buildPayShareText({
  businessName,
  upiId,
  amount,
  language = "en",
}) {
  const lang = normalizeLanguage(language);
  const value = Number(amount);
  const hasAmount = Number.isFinite(value) && value > 0;
  const lines = [
    translate(lang, "pay.shareTitle", {
      name: businessName || translate(lang, "pay.yourBusiness"),
    }),
  ];

  if (hasAmount) {
    lines.push(
      translate(lang, "pay.shareAmount", { amount: formatINR(value) })
    );
  }

  if (upiId) {
    lines.push(translate(lang, "pay.shareUpi", { upi: upiId }));
  }

  lines.push("", translate(lang, "pay.shareHint"));
  return lines.filter(Boolean).join("\n");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Captures the themed QR poster (with amount if shown) and shares it.
 * Falls back to download, then to a plain text share.
 */
export async function sharePayPoster({
  element,
  businessName,
  upiId,
  amount,
  language = "en",
}) {
  const lang = normalizeLanguage(language);
  const text = buildPayShareText({
    businessName,
    upiId,
    amount,
    language: lang,
  });
  const title = translate(lang, "pay.shareSheetTitle");
  const filename = "payment-qr.png";

  if (element) {
    try {
      const { toBlob } = await import("html-to-image");
      const blob = await toBlob(element, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#000000",
        width: POSTER_WIDTH,
        height: POSTER_HEIGHT,
        style: {
          transform: "none",
          left: "0px",
          top: "0px",
          margin: "0px",
        },
      });

      if (blob) {
        const file = new File([blob], filename, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title, text });
          return "shared";
        }
        downloadBlob(blob, filename);
        return "downloaded";
      }
    } catch (error) {
      if (error?.name === "AbortError") return "cancelled";
      // Fall through to text share.
    }
  }

  try {
    if (navigator.share) {
      await navigator.share({ title, text });
      return "shared";
    }
  } catch (error) {
    if (error?.name === "AbortError") return "cancelled";
  }

  openWhatsApp({ text });
  return "whatsapp";
}
