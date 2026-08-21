import { BACKGROUND_COLOR } from "@/lib/branding";
import { formatBillNumber } from "@/lib/format";
import { normalizeLanguage, translate } from "@/lib/i18n";
import { openWhatsApp } from "@/lib/share";

const MAX_CANVAS_EDGE = 4096;

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function capturePixelRatio(width, height) {
  const cap = Math.min(
    MAX_CANVAS_EDGE / Math.max(1, width),
    MAX_CANVAS_EDGE / Math.max(1, height)
  );
  return Math.max(1, Math.min(2.5, window.devicePixelRatio || 2, cap));
}

async function waitForPaint() {
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

async function captureBillBlob(element) {
  await waitForPaint();
  const width = Math.max(1, Math.round(element.offsetWidth || element.scrollWidth));
  const height = Math.max(1, Math.round(element.offsetHeight || element.scrollHeight));
  const pixelRatio = capturePixelRatio(width, height);
  const { toBlob } = await import("html-to-image");
  const blob = await toBlob(element, {
    pixelRatio,
    cacheBust: true,
    backgroundColor: BACKGROUND_COLOR,
    width,
    height,
    style: {
      transform: "none",
      left: "0px",
      top: "0px",
      margin: "0px",
    },
  });
  if (!blob) throw new Error("bill image failed");
  return blob;
}

function customerPhone(customer) {
  return String(customer?.phone || "").replace(/\D/g, "");
}

/**
 * Opens the customer's WhatsApp chat (same as before). The themed bill PNG is
 * attached when we can send a file straight into WhatsApp; chat links cannot
 * carry photos, so a customer number always goes to that chat with the caption.
 */
export async function shareBillImage({
  element,
  text,
  entry,
  customer,
  language = "en",
}) {
  const lang = normalizeLanguage(language);
  const title = translate(lang, "entry.shareEntry");
  const filename = `${formatBillNumber(entry)}.png`;
  const phone = customer?.phone;

  // Known customer → their WhatsApp chat, like the old bill share. wa.me
  // cannot attach a photo, so we never show the OS share list here.
  if (customerPhone(customer)) {
    openWhatsApp({ phone, text });
    return "whatsapp";
  }

  if (element) {
    try {
      const blob = await captureBillBlob(element);
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title, text });
        return "shared";
      }
      downloadBlob(blob, filename);
    } catch (error) {
      if (error?.name === "AbortError") return "cancelled";
    }
  }

  openWhatsApp({ phone, text });
  return "whatsapp";
}
