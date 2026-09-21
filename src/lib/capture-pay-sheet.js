import { BACKGROUND_COLOR } from "@/lib/branding";

const MAX_CANVAS_EDGE = 4096;

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function capturePixelRatio(width, height) {
  const cap = Math.min(
    MAX_CANVAS_EDGE / Math.max(1, width),
    MAX_CANVAS_EDGE / Math.max(1, height)
  );
  return Math.max(1, Math.min(3, window.devicePixelRatio || 2, cap));
}

async function waitForPaint() {
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

async function bitmapFromUrl(src) {
  const href = new URL(src, window.location.href).href;
  const response = await fetch(href, { cache: "force-cache" });
  if (!response.ok) throw new Error("logo fetch failed");
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

function mapRect(rootRect, rect, canvasWidth, canvasHeight) {
  const sx = canvasWidth / rootRect.width;
  const sy = canvasHeight / rootRect.height;
  return {
    x: (rect.left - rootRect.left) * sx,
    y: (rect.top - rootRect.top) * sy,
    w: rect.width * sx,
    h: rect.height * sy,
  };
}

/**
 * html-to-image drops WebP in the SVG snapshot — redraw logo nodes after.
 */
async function redrawWebpLogos(ctx, element, canvasWidth, canvasHeight) {
  const rootRect = element.getBoundingClientRect();
  if (!rootRect.width || !rootRect.height) return;

  const wraps = element.querySelectorAll(
    "[data-pay-sheet-logo], [data-poster-qr-logo]"
  );

  for (const wrap of wraps) {
    const img = wrap.matches("img") ? wrap : wrap.querySelector("img");
    if (!img) continue;
    const src = img.currentSrc || img.getAttribute("src");
    if (!src) continue;

    let bitmap;
    try {
      bitmap = await bitmapFromUrl(src);
    } catch {
      continue;
    }

    const box = mapRect(rootRect, wrap.getBoundingClientRect(), canvasWidth, canvasHeight);
    const logo = mapRect(rootRect, img.getBoundingClientRect(), canvasWidth, canvasHeight);
    const radius = Math.min(box.w, box.h) * 0.22;

    ctx.save();
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(box.x, box.y, box.w, box.h, radius);
    } else {
      ctx.rect(box.x, box.y, box.w, box.h);
    }
    ctx.clip();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(box.x, box.y, box.w, box.h);

    const cover = Math.max(
      logo.w / Math.max(1, bitmap.width),
      logo.h / Math.max(1, bitmap.height)
    );
    const dw = bitmap.width * cover;
    const dh = bitmap.height * cover;
    ctx.drawImage(
      bitmap,
      logo.x + (logo.w - dw) / 2,
      logo.y + (logo.h - dh) / 2,
      dw,
      dh
    );
    ctx.restore();
    bitmap.close?.();
  }
}

function resolveBackground(element) {
  const color = window.getComputedStyle(element).backgroundColor;
  if (color && color !== "rgba(0, 0, 0, 0)" && color !== "transparent") {
    return color;
  }
  return BACKGROUND_COLOR;
}

async function captureElementPng(element) {
  await waitForPaint();
  // Ensure fonts/images used by the card are ready before snapshot.
  const ready = [];
  if (document.fonts?.ready) ready.push(document.fonts.ready);
  for (const img of element.querySelectorAll("img")) {
    if (img.decode) ready.push(img.decode().catch(() => {}));
  }
  await Promise.allSettled(ready);

  const width = Math.max(1, Math.round(element.offsetWidth || element.scrollWidth));
  const height = Math.max(1, Math.round(element.offsetHeight || element.scrollHeight));
  const pixelRatio = capturePixelRatio(width, height);
  const backgroundColor = resolveBackground(element);
  const { toCanvas } = await import("html-to-image");

  const overlay = await toCanvas(element, {
    pixelRatio,
    cacheBust: true,
    backgroundColor,
    width,
    height,
    style: {
      transform: "none",
      animation: "none",
      left: "0px",
      top: "0px",
      margin: "0px",
    },
    filter: (node) => {
      if (node?.dataset?.paySheetExclude != null) return false;
      if (node?.closest?.("[data-pay-sheet-exclude]")) return false;
      return true;
    },
  });

  const canvas = document.createElement("canvas");
  canvas.width = overlay.width;
  canvas.height = overlay.height;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(overlay, 0, 0);
  await redrawWebpLogos(ctx, element, canvas.width, canvas.height);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("png failed"))),
      "image/png"
    );
  });
  return blob;
}

/**
 * Capture the pay-sheet card (no action buttons) and download as PNG.
 * Retries once — html-to-image can flake on the first paint after open.
 */
export async function downloadPaySheetCard(element, filename = "moneykit-pay-qr.png") {
  if (!element) throw new Error("missing pay sheet card");

  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      if (attempt > 0) await waitForPaint();
      const blob = await captureElementPng(element);
      downloadBlob(blob, filename.endsWith(".png") ? filename : `${filename}.png`);
      return true;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("download failed");
}
