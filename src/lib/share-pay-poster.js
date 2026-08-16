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

const MAX_CANVAS_EDGE = 4096;

function capturePixelRatio() {
  const cap = Math.min(
    MAX_CANVAS_EDGE / POSTER_WIDTH,
    MAX_CANVAS_EDGE / POSTER_HEIGHT
  );
  return Math.max(1, Math.min(2.5, window.devicePixelRatio || 2, cap));
}

function posterBgImage(element) {
  return element?.querySelector?.("[data-poster-bg]") || null;
}

async function bitmapFromUrl(src) {
  const href = new URL(src, window.location.href).href;
  const response = await fetch(href, { cache: "force-cache" });
  if (!response.ok) throw new Error("theme image fetch failed");
  const blob = await response.blob();
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(blob);
  }
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.decoding = "async";
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = objectUrl;
    });
    await image.decode?.().catch(() => {});
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function drawThemeArtwork(ctx, element, width, height) {
  const img = posterBgImage(element);
  if (img?.naturalWidth) {
    try {
      ctx.drawImage(img, 0, 0, width, height);
      return;
    } catch {
      // Tainted or incomplete — load a fresh bitmap instead.
    }
  }
  const src = img?.getAttribute("src") || img?.currentSrc;
  if (!src) return;
  const bitmap = await bitmapFromUrl(src);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
}

/**
 * Safari drops WebP when html-to-image embeds it in an SVG snapshot, which
 * is why shares were coming out black. Draw the artwork via canvas, then
 * overlay text/QR from a transparent html-to-image pass.
 */
async function capturePosterBlob(element) {
  const pixelRatio = capturePixelRatio();
  const width = Math.round(POSTER_WIDTH * pixelRatio);
  const height = Math.round(POSTER_HEIGHT * pixelRatio);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);
  await drawThemeArtwork(ctx, element, width, height);

  const { toCanvas } = await import("html-to-image");
  const overlay = await toCanvas(element, {
    pixelRatio,
    skipAutoScale: true,
    cacheBust: false,
    backgroundColor: "transparent",
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    canvasWidth: width,
    canvasHeight: height,
    filter: (node) => node?.getAttribute?.("data-poster-bg") !== "true",
    style: {
      transform: "none",
      left: "0px",
      top: "0px",
      margin: "0px",
      background: "transparent",
      backgroundColor: "transparent",
    },
  });
  ctx.drawImage(overlay, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("poster blob failed"))),
      "image/png"
    );
  });
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
      const blob = await capturePosterBlob(element);
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
