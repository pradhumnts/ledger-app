/**
 * Per-theme layout & typography for QR payment posters.
 *
 * Coordinates use a 853×1844 design canvas (% = percentage of poster size).
 * When adding a theme: drop background in public/qr-themes/, send a reference
 * mockup, and fill in `elements` to match positions/fonts/QR style.
 */

/**
 * Posters render on this fixed board (same 853×1844 ratio) which is then scaled
 * to cover the screen. Percentages therefore mean the same thing on every phone.
 */
export const POSTER_WIDTH = 390;
export const POSTER_HEIGHT = 843;

/** Breathing room between the QR card and the UPI id, in design-canvas pixels. */
const MIN_QR_TO_UPI_GAP = 18;

/** Room the UPI id line needs below its anchor, in design-canvas pixels. */
const UPI_LINE_HEIGHT = 30;

export const QR_FONTS = {
  "dm-sans": {
    family: '"DM Sans", sans-serif',
    href: "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap",
  },
  playfair: {
    family: '"Playfair Display", serif',
    href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap",
  },
  oswald: {
    family: '"Oswald", sans-serif',
    href: "https://fonts.googleapis.com/css2?family=Oswald:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&display=swap",
  },
  lora: {
    family: '"Lora", serif',
    href: "https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&display=swap",
  },
  "space-grotesk": {
    family: '"Space Grotesk", sans-serif',
    href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap",
  },
  nunito: {
    family: '"Nunito", sans-serif',
    href: "https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700;800&display=swap",
  },
  "libre-baskerville": {
    family: '"Libre Baskerville", serif',
    href: "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap",
  },
  montserrat: {
    family: '"Montserrat", sans-serif',
    href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&display=swap",
  },
  "bodoni-moda": {
    family: '"Bodoni Moda", serif',
    href: "https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500;6..96,600&display=swap",
  },
  "great-vibes": {
    family: '"Great Vibes", cursive',
    href: "https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap",
  },
  cinzel: {
    family: '"Cinzel", serif',
    href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&display=swap",
  },
  cause: {
    family: '"Cause", sans-serif',
    href: "https://fonts.googleapis.com/css2?family=Cause:wght@400;600;700;800&display=swap",
  },
  sutrika: {
    family: '"Sutrika Display", serif',
  },
};

/**
 * Overlay chrome for pay-page controls (amount field and hint).
 * "light" = dark text on opaque frost — use on cream/white posters.
 * "dark"  = white text on glass — use on navy/photo/dark posters.
 */
export const PAY_CHROME = {
  light: {
    field:
      "rounded-2xl border border-black/10 bg-white/90 px-3 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.12)] backdrop-blur-2xl",
    input:
      "h-10 border-0 bg-transparent text-center text-base font-semibold tabular-nums text-zinc-900 shadow-none placeholder:text-zinc-500 focus-visible:border-transparent focus-visible:ring-0",
    hint: "mt-2 text-center text-[11px] font-medium text-zinc-600",
  },
  dark: {
    field: "rounded-2xl border border-white/20 bg-white/20 px-3 py-2.5 shadow-lg backdrop-blur-2xl",
    input:
      "h-10 border-0 bg-transparent text-center text-base font-semibold tabular-nums text-white shadow-none placeholder:text-white/70 focus-visible:border-transparent focus-visible:ring-0",
    hint: "mt-2 text-center text-[11px] font-medium text-white/80",
  },
};

/** Shared defaults — override any field per theme. */
export const QR_STYLE_DEFAULTS = {
  font: "dm-sans",
  chrome: "dark",
  logo: {
    show: true,
    top: "8%",
    size: 48,
    ring: "2px solid rgba(255,255,255,0.85)",
  },
  businessName: {
    top: "13.5%",
    fontSize: "1.15rem",
    fontWeight: 600,
    color: "#18181b",
    letterSpacing: "-0.02em",
  },
  scanHint: {
    show: false,
    top: "31%",
    fontSize: "0.68rem",
    fontWeight: 600,
    color: "#71717a",
    letterSpacing: "0.14em",
    text: "SCAN TO PAY",
    uppercase: true,
  },
  qr: {
    top: "34.5%",
    width: "41%",
    padding: 10,
    borderRadius: 18,
    bg: "#ffffff",
    fg: "#18181b",
    style: "square",
    shadow: "0 10px 28px rgba(0,0,0,0.12)",
  },
  amount: {
    show: true,
    top: "56%",
    fontSize: "1.65rem",
    fontWeight: 700,
    color: "#0b301f",
    prefix: "₹",
  },
  upi: {
    top: "62%",
    fontSize: "0.82rem",
    fontWeight: 500,
    color: "#3f3f46",
    variant: "pill",
    bg: "rgba(255,255,255,0.92)",
    maxWidth: "78%",
  },
  copied: {
    top: "66.5%",
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "#0b301f",
  },
  divider: {
    show: false,
    top: "28.5%",
    topWithAmount: "24.2%",
    width: "17%",
    height: 1,
    color: "#c9b89a",
  },
};

/** Per-theme overrides — tune each when reference mockups arrive. */
export const QR_THEME_STYLES = {
  salon: {
    chrome: "light",
    font: "bodoni-moda",
    logo: { show: false },
    businessName: {
      top: "26%",
      topWithAmount: "20%",
      fontSize: "2.45rem",
      fontWeight: 600,
      color: "#2a1528",
      letterSpacing: "0.07em",
      uppercase: true,
      stacked: true,
      lineHeight: 1.06,
    },
    scanHint: { show: false },
    amount: {
      show: true,
      top: "34%",
      fontSize: "2rem",
      fontWeight: 500,
      color: "#5c4030",
      font: "bodoni-moda",
    },
    qr: {
      top: "39%",
      topWithAmount: "42.5%",
      width: "56%",
      padding: 12,
      borderRadius: 18,
      style: "square",
      fg: "#111111",
      bg: "#ffffff",
      shadow: "none",
    },
    upi: {
      top: "67.6%",
      topWithAmount: "71%",
      fontSize: "0.88rem",
      fontWeight: 400,
      color: "#2d2d2d",
      variant: "plain",
      font: "dm-sans",
      lowercase: true,
      hideCopyIcon: true,
      maxWidth: "86%",
    },
    copied: { top: "70.2%", topWithAmount: "73.6%", color: "#5c3d4f", fontSize: "0.72rem" },
  },
  beauty: {
    chrome: "light",
    font: "great-vibes",
    logo: { show: false },
    businessName: {
      top: "33.4%",
      topWithAmount: "27.2%",
      fontSize: "3.35rem",
      fontWeight: 400,
      color: "#5c1218",
      letterSpacing: "0.01em",
      stacked: true,
      lineHeight: 0.92,
      line2Font: "cinzel",
      line2FontSize: "0.78rem",
      line2FontWeight: 600,
      line2LetterSpacing: "0.46em",
      line2Uppercase: true,
    },
    divider: {
      show: true,
      variant: "flourish",
      top: "41.8%",
      topWithAmount: "39%",
      width: "34%",
      height: 1,
      color: "#c5a059",
    },
    scanHint: { show: false },
    amount: {
      show: true,
      top: "41.6%",
      fontSize: "2.15rem",
      fontWeight: 700,
      color: "#5c1218",
      font: "playfair",
    },
    qr: {
      top: "45.4%",
      topWithAmount: "49%",
      width: "56%",
      padding: 12,
      borderRadius: 18,
      style: "square",
      fg: "#111111",
      bg: "#ffffff",
      shadow: "0 8px 24px rgba(92,18,24,0.08)",
    },
    upi: {
      top: "71.6%",
      topWithAmount: "75.2%",
      fontSize: "0.86rem",
      fontWeight: 400,
      color: "#6b1a22",
      variant: "plain",
      font: "dm-sans",
      lowercase: true,
      hideCopyIcon: true,
      maxWidth: "86%",
    },
    copied: { top: "74.2%", topWithAmount: "77.8%", color: "#5c1218", fontSize: "0.72rem" },
  },
  clinic: {
    chrome: "light",
    font: "montserrat",
    logo: { show: false },
    businessName: {
      top: "26.2%",
      topWithAmount: "21.8%",
      fontSize: "1.72rem",
      fontWeight: 700,
      color: "#12305a",
      letterSpacing: "0.11em",
      uppercase: true,
    },
    scanHint: { show: false },
    amount: {
      show: true,
      top: "29.2%",
      fontSize: "2.35rem",
      fontWeight: 600,
      color: "#7a9a86",
      font: "dm-sans",
    },
    qr: {
      top: "33.6%",
      topWithAmount: "39.4%",
      width: "60%",
      padding: 11,
      borderRadius: 18,
      style: "square",
      fg: "#111111",
      bg: "#ffffff",
      shadow: "none",
    },
    upi: {
      top: "65.4%",
      topWithAmount: "69.2%",
      fontSize: "0.86rem",
      fontWeight: 400,
      color: "#12305a",
      variant: "plain",
      font: "dm-sans",
      lowercase: true,
      hideCopyIcon: true,
      maxWidth: "86%",
    },
    copied: { top: "68%", topWithAmount: "71.8%", color: "#12305a", fontSize: "0.72rem" },
  },
  coaching: {
    chrome: "light",
    font: "oswald",
    logo: { show: false },
    businessName: {
      top: "26%",
      topWithAmount: "20.6%",
      fontSize: "3.95rem",
      fontWeight: 700,
      color: "#033DDA",
      letterSpacing: "0.02em",
      uppercase: true,
      stacked: true,
      fontStyle: "italic",
      lineHeight: 0.88,
      line2Font: "oswald",
      line2FontSize: "0.82rem",
      line2FontWeight: 700,
      line2LetterSpacing: "0.34em",
      line2Uppercase: true,
      line2Color: "#111827",
      line2FontStyle: "italic",
      line2Lines: true,
      line2LineColor: "#9ed927",
    },
    scanHint: { show: false },
    amount: {
      show: true,
      top: "33.6%",
      fontSize: "2.85rem",
      fontWeight: 700,
      color: "#033DDA",
      prefixColor: "#9ed927",
      font: "oswald",
      fontStyle: "italic",
    },
    qr: {
      top: "38.8%",
      topWithAmount: "44.2%",
      width: "58%",
      padding: 12,
      borderRadius: 18,
      style: "square",
      fg: "#111111",
      bg: "#ffffff",
      shadow: "0 8px 24px rgba(0,0,0,0.12)",
    },
    upi: {
      top: "67.2%",
      topWithAmount: "72%",
      fontSize: "1rem",
      fontWeight: 600,
      color: "#111827",
      highlightHandle: true,
      highlightColor: "#9ed927",
      variant: "plain",
      font: "oswald",
      fontStyle: "italic",
      lowercase: true,
      hideCopyIcon: true,
      maxWidth: "88%",
    },
    copied: { top: "69.8%", topWithAmount: "74.6%", color: "#111827", fontSize: "0.72rem" },
  },
  fitness: {
    chrome: "dark",
    font: "oswald",
    logo: { show: false },
    businessName: {
      top: "25.6%",
      topWithAmount: "19.6%",
      fontSize: "3.9rem",
      fontWeight: 900,
      color: "#E54B0B",
      letterSpacing: "0.02em",
      uppercase: true,
      stacked: true,
      fontStyle: "italic",
      lineHeight: 1,
      line2Font: "oswald",
      line2FontSize: "1.12rem",
      line2FontWeight: 600,
      line2LetterSpacing: "0.48em",
      line2Uppercase: true,
      line2Color: "#E54B0B",
      line2FontStyle: "italic",
    },
    scanHint: { show: false },
    amount: {
      show: true,
      top: "33.6%",
      fontSize: "3.05rem",
      fontWeight: 600,
      color: "#ffffff",
      font: "oswald",
      fontStyle: "normal",
      letterSpacing: "0.02em",
    },
    qr: {
      top: "37.2%",
      topWithAmount: "43.6%",
      width: "60%",
      padding: 12,
      borderRadius: 18,
      style: "square",
      fg: "#111111",
      bg: "#ffffff",
      shadow: "0 10px 32px rgba(0,0,0,0.4)",
    },
    upi: {
      top: "66.2%",
      topWithAmount: "71.4%",
      fontSize: "1.12rem",
      fontWeight: 500,
      color: "#ffffff",
      variant: "plain",
      font: "oswald",
      fontStyle: "normal",
      letterSpacing: "0.04em",
      lowercase: true,
      hideCopyIcon: true,
      maxWidth: "90%",
    },
    copied: { top: "69.2%", topWithAmount: "74.4%", color: "#ffffff", fontSize: "0.78rem" },
  },
  photographer: {
    chrome: "light",
    font: "libre-baskerville",
    logo: { show: false },
    businessName: {
      top: "26.4%",
      topWithAmount: "22.4%",
      fontSize: "2.15rem",
      fontWeight: 700,
      color: "#1a3347",
      letterSpacing: "0.1em",
      uppercase: true,
    },
    divider: { show: false },
    scanHint: { show: false },
    amount: {
      show: true,
      top: "34.8%",
      topWithAmount: "31.6%",
      fontSize: "2.35rem",
      fontWeight: 700,
      color: "#1a3347",
      font: "libre-baskerville",
    },
    qr: {
      top: "41.2%",
      topWithAmount: "44.8%",
      width: "54%",
      padding: 11,
      borderRadius: 18,
      style: "square",
      fg: "#111111",
      bg: "#ffffff",
      shadow: "0 8px 28px rgba(26,51,71,0.1)",
    },
    upi: {
      top: "67.2%",
      topWithAmount: "70.6%",
      fontSize: "0.86rem",
      fontWeight: 400,
      color: "#1a3347",
      variant: "plain",
      font: "dm-sans",
      lowercase: true,
      hideCopyIcon: true,
      maxWidth: "86%",
    },
    copied: { top: "69.8%", topWithAmount: "73.2%", color: "#1a3347", fontSize: "0.72rem" },
  },
  "toy-store": {
    chrome: "dark",
    font: "cause",
    logo: { show: false },
    businessName: {
      top: "26.4%",
      topWithAmount: "21%",
      fontSize: "3.05rem",
      fontWeight: 800,
      color: "#ffffff",
      uppercase: true,
      stacked: true,
      stackedWords: true,
      lineHeight: 0.88,
      wordStyles: [
        { color: "#ffffff" },
        { letterColors: ["#ffd24a", "#ff7a2f", "#ffd24a"] },
        { color: "#ffffff" },
      ],
    },
    scanHint: { show: false },
    amount: {
      show: true,
      top: "36.4%",
      fontSize: "3.15rem",
      fontWeight: 800,
      color: "#ffd24a",
      font: "cause",
    },
    qr: {
      top: "42.4%",
      topWithAmount: "47.4%",
      width: "58%",
      padding: 12,
      borderRadius: 22,
      style: "square",
      fg: "#111111",
      bg: "#ffffff",
      shadow: "0 10px 28px rgba(0,0,0,0.22)",
    },
    upi: {
      top: "72%",
      topWithAmount: "77%",
      fontSize: "1.02rem",
      fontWeight: 600,
      color: "#ffffff",
      variant: "plain",
      font: "cause",
      lowercase: true,
      hideCopyIcon: true,
      maxWidth: "88%",
    },
    copied: { top: "74.6%", topWithAmount: "79.6%", color: "#ffffff", fontSize: "0.72rem" },
  },
  "fashion-stitch": {
    chrome: "light",
    font: "sutrika",
    logo: { show: false },
    businessName: {
      top: "23.6%",
      topWithAmount: "20.2%",
      fontSize: "3.35rem",
      fontWeight: 400,
      color: "#4a241c",
      letterSpacing: "0.04em",
      uppercase: true,
      stacked: true,
      lineHeight: 0.96,
      line2Font: "sutrika",
      line2FontSize: "1.02rem",
      line2FontWeight: 400,
      line2LetterSpacing: "0.38em",
      line2Uppercase: true,
      line2Color: "#4a241c",
    },
    scanHint: { show: false },
    amount: {
      show: true,
      top: "31.6%",
      fontSize: "1.82rem",
      fontWeight: 700,
      color: "#4a241c",
      font: "sutrika",
    },
    qr: {
      top: "35.4%",
      topWithAmount: "39.8%",
      width: "55%",
      padding: 12,
      borderRadius: 16,
      style: "square",
      fg: "#111111",
      bg: "#ffffff",
      shadow: "0 12px 32px rgba(74,36,28,0.14)",
    },
    upi: {
      top: "62.4%",
      topWithAmount: "66.6%",
      fontSize: "0.95rem",
      fontWeight: 700,
      color: "#4a241c",
      variant: "plain",
      font: "sutrika",
      lowercase: true,
      hideCopyIcon: true,
      maxWidth: "78%",
    },
    copied: {
      top: "65%",
      topWithAmount: "69.2%",
      color: "#6b4535",
      fontSize: "0.72rem",
    },
  },
  jewellery: {
    chrome: "light",
    font: "sutrika",
    logo: { show: false },
    businessName: {
      top: "23.6%",
      topWithAmount: "20.2%",
      fontSize: "3.35rem",
      fontWeight: 400,
      color: "#8a6840",
      letterSpacing: "0.04em",
      uppercase: true,
      stacked: true,
      lineHeight: 0.96,
      line2Font: "sutrika",
      line2FontSize: "1.02rem",
      line2FontWeight: 400,
      line2LetterSpacing: "0.38em",
      line2Uppercase: true,
      line2Color: "#8a6840",
    },
    scanHint: { show: false },
    amount: {
      show: true,
      top: "31.6%",
      fontSize: "1.82rem",
      fontWeight: 700,
      color: "#8a6840",
      font: "sutrika",
    },
    qr: {
      top: "35.4%",
      topWithAmount: "39.8%",
      width: "55%",
      padding: 12,
      borderRadius: 12,
      style: "square",
      fg: "#111111",
      bg: "#ffffff",
      shadow: "0 10px 28px rgba(26,51,32,0.12)",
    },
    upi: {
      top: "62.4%",
      topWithAmount: "66.6%",
      fontSize: "0.95rem",
      fontWeight: 700,
      color: "#8a6840",
      variant: "plain",
      font: "sutrika",
      lowercase: true,
      hideCopyIcon: true,
      maxWidth: "78%",
    },
    copied: {
      top: "65%",
      topWithAmount: "69.2%",
      color: "#8a6840",
      fontSize: "0.72rem",
    },
  },
  eyeglasses: {
    chrome: "light",
    font: "sutrika",
    logo: { show: false },
    businessName: {
      top: "24.2%",
      topWithAmount: "20.8%",
      fontSize: "2.85rem",
      fontWeight: 400,
      color: "#1c1c1c",
      letterSpacing: "0.08em",
      uppercase: true,
      stacked: true,
      lineHeight: 1.02,
      line2Font: "sutrika",
      line2FontSize: "1.02rem",
      line2FontWeight: 400,
      line2LetterSpacing: "0.38em",
      line2Uppercase: true,
      line2Color: "#1c1c1c",
    },
    scanHint: { show: false },
    amount: {
      show: true,
      top: "32.2%",
      fontSize: "1.72rem",
      fontWeight: 500,
      color: "#1c1c1c",
      font: "dm-sans",
    },
    qr: {
      top: "35.8%",
      topWithAmount: "40.2%",
      width: "62%",
      padding: 12,
      borderRadius: 8,
      style: "square",
      fg: "#111111",
      bg: "#ffffff",
      shadow: "0 8px 24px rgba(0,0,0,0.08)",
    },
    upi: {
      top: "66.8%",
      topWithAmount: "71.4%",
      fontSize: "0.86rem",
      fontWeight: 400,
      color: "#1c1c1c",
      variant: "plain",
      font: "dm-sans",
      lowercase: true,
      hideCopyIcon: true,
      maxWidth: "82%",
    },
    copied: {
      top: "69.4%",
      topWithAmount: "74%",
      color: "#1c1c1c",
      fontSize: "0.72rem",
    },
  },
  "mobile-accessories": {
    chrome: "light",
    font: "montserrat",
    logo: { show: false },
    businessName: {
      top: "23.8%",
      topWithAmount: "19.6%",
      fontSize: "1.78rem",
      fontWeight: 600,
      color: "#1a1a1a",
      letterSpacing: "0.12em",
      uppercase: true,
      wrapLines: 2,
      lineHeight: 1.12,
    },
    scanHint: { show: false },
    amount: {
      show: true,
      top: "31.2%",
      fontSize: "2.2rem",
      fontWeight: 700,
      color: "#1a1a1a",
      font: "oswald",
    },
    qr: {
      top: "34.4%",
      topWithAmount: "39.2%",
      width: "58%",
      padding: 14,
      borderRadius: 28,
      style: "square",
      fg: "#111111",
      bg: "#ffffff",
      shadow: "0 8px 24px rgba(0,0,0,0.08)",
    },
    upi: {
      top: "65.6%",
      topWithAmount: "70.2%",
      fontSize: "0.86rem",
      fontWeight: 400,
      color: "#1a1a1a",
      variant: "plain",
      font: "dm-sans",
      lowercase: true,
      hideCopyIcon: true,
      maxWidth: "82%",
    },
    copied: {
      top: "68.2%",
      topWithAmount: "72.8%",
      color: "#1a1a1a",
      fontSize: "0.72rem",
    },
  },
};

function mergeDeep(base, override) {
  if (!override) return { ...base };
  const out = { ...base };
  for (const key of Object.keys(override)) {
    const val = override[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      out[key] = mergeDeep(base[key] || {}, val);
    } else {
      out[key] = val;
    }
  }
  return out;
}

export function resolveQrThemeStyle(themeId) {
  const overrides = QR_THEME_STYLES[themeId] || {};
  const { font: fontKey, ...rest } = overrides;
  const merged = mergeDeep(QR_STYLE_DEFAULTS, rest);
  merged.font = fontKey || QR_STYLE_DEFAULTS.font;
  merged.fontFamily = QR_FONTS[merged.font]?.family || QR_FONTS["dm-sans"].family;
  merged.fontHref = QR_FONTS[merged.font]?.href || QR_FONTS["dm-sans"].href;
  merged.businessNameFontFamily =
    QR_FONTS[merged.businessName?.font || merged.font]?.family || merged.fontFamily;
  merged.businessNameFontHref =
    QR_FONTS[merged.businessName?.font || merged.font]?.href || merged.fontHref;
  merged.amountFontFamily =
    QR_FONTS[merged.amount?.font || merged.font]?.family || merged.fontFamily;
  merged.amountFontHref =
    QR_FONTS[merged.amount?.font || merged.font]?.href || merged.fontHref;
  merged.upiFontFamily =
    QR_FONTS[merged.upi?.font || merged.font]?.family || merged.fontFamily;
  merged.upiFontHref =
    QR_FONTS[merged.upi?.font || merged.font]?.href || merged.fontHref;
  merged.line2FontFamily =
    QR_FONTS[merged.businessName?.line2Font]?.family || merged.businessNameFontFamily;
  merged.line2FontHref = QR_FONTS[merged.businessName?.line2Font]?.href;
  return merged;
}

export function getQrThemeFontHrefs(themeId) {
  const cfg = resolveQrThemeStyle(themeId);
  return [
    ...new Set(
      [
        cfg.fontHref,
        cfg.businessNameFontHref,
        cfg.line2FontHref,
        cfg.amountFontHref,
        cfg.upiFontHref,
      ].filter(Boolean)
    ),
  ];
}

export function preloadQrFontHrefs(hrefs = []) {
  if (typeof document === "undefined") return;
  hrefs.filter(Boolean).forEach((href) => {
    const id = `qr-font-${btoa(href).slice(0, 12)}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  });
}

export function getFontHref(fontKey) {
  return QR_FONTS[fontKey]?.href;
}

export function posStyle(top, extra = {}) {
  return {
    top,
    left: "50%",
    transform: "translateX(-50%)",
    ...extra,
  };
}

export function pickTop(cfg, hasAmount) {
  if (!cfg) return undefined;
  return hasAmount && cfg.topWithAmount ? cfg.topWithAmount : cfg.top;
}

function percentValue(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim().endsWith("%")) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function roundPercent(value) {
  return `${Math.round(value * 1000) / 1000}%`;
}

/**
 * Resolves the stacked positions of the QR card, UPI id and copied toast, plus
 * the band the poster's content occupies.
 *
 * The QR card is square and sized off the board width, so its height in percent
 * depends on the board ratio. Deriving the UPI id from the card's real bottom
 * keeps them apart even when a theme's tuned value is optimistic.
 */
export function layoutQrPoster(cfg, hasAmount) {
  const qrTop = percentValue(pickTop(cfg.qr, hasAmount)) ?? 0;
  const qrWidth = percentValue(cfg.qr?.width) ?? 0;
  const qrHeight = ((qrWidth / 100) * POSTER_WIDTH * 100) / POSTER_HEIGHT;
  const qrBottom = qrTop + qrHeight;

  const upiTuned = percentValue(pickTop(cfg.upi, hasAmount)) ?? qrBottom;
  const upiTop = Math.max(
    upiTuned,
    qrBottom + (MIN_QR_TO_UPI_GAP * 100) / POSTER_HEIGHT
  );
  const drop = upiTop - upiTuned;
  const copiedTuned = percentValue(pickTop(cfg.copied, hasAmount)) ?? upiTop + 3;

  const heads = [
    cfg.logo?.show ? percentValue(pickTop(cfg.logo, hasAmount)) : null,
    percentValue(pickTop(cfg.businessName, hasAmount)),
    hasAmount && cfg.amount?.show
      ? percentValue(pickTop(cfg.amount, hasAmount))
      : null,
  ].filter((value) => value != null);

  return {
    qrTop: roundPercent(qrTop),
    upiTop: roundPercent(upiTop),
    copiedTop: roundPercent(copiedTuned + drop),
    contentTop: heads.length ? Math.min(...heads) : qrTop,
    contentBottom: upiTop + (UPI_LINE_HEIGHT * 100) / POSTER_HEIGHT,
  };
}
