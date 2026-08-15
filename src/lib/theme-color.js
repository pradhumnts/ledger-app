const TOP_COLOR_CACHE = new Map();

function toHex(r, g, b) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Average colour of a poster's top strip.
 *
 * iOS keeps the status bar opaque for installed apps, so the pay screen paints
 * it with this colour and the poster reads as one uninterrupted image.
 */
export function sampleImageTopColor(src) {
  if (typeof document === "undefined" || !src) return Promise.resolve(null);
  if (TOP_COLOR_CACHE.has(src)) return Promise.resolve(TOP_COLOR_CACHE.get(src));

  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";

    img.onload = () => {
      let color = null;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const stripHeight = Math.max(
          1,
          Math.round((img.naturalHeight || img.height) * 0.04)
        );
        ctx.drawImage(
          img,
          0,
          0,
          img.naturalWidth || img.width,
          stripHeight,
          0,
          0,
          1,
          1
        );
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        color = toHex(r, g, b);
      } catch {
        color = null;
      }
      TOP_COLOR_CACHE.set(src, color);
      resolve(color);
    };

    img.onerror = () => resolve(null);
    img.src = src;
  });
}
