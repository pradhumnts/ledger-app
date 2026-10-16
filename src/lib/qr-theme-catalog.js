/**
 * Server QR theme catalog: style recipes, built-in Google fonts, and helpers
 * for the admin drag editor. Custom fonts live in `qr_theme_fonts`.
 */
import {
  QR_FONTS,
  QR_STYLE_DEFAULTS,
  POSTER_HEIGHT,
  POSTER_WIDTH,
} from "@/lib/qr-theme-styles";

export { POSTER_HEIGHT, POSTER_WIDTH, QR_STYLE_DEFAULTS };

/** Onboarding / filter tags for themes (includes events; no retail). */
export const QR_THEME_BUSINESS_TYPES = [
  { id: "salon", label: "Salon" },
  { id: "beauty", label: "Beauty" },
  { id: "clinic", label: "Clinic" },
  { id: "education", label: "Education" },
  { id: "fitness", label: "Fitness" },
  { id: "photographer", label: "Photographer" },
  { id: "fashion", label: "Fashion" },
  { id: "restaurant", label: "Restaurant / Cafe" },
  { id: "events", label: "Events" },
  { id: "jewellery", label: "Jewellery" },
  { id: "eyeglasses", label: "Eyeglasses" },
  { id: "mobiles", label: "Mobiles" },
  { id: "other", label: "Other / General" },
];

const TYPE_IDS = new Set(QR_THEME_BUSINESS_TYPES.map((t) => t.id));

export const BUCKET = "qr-theme-assets";
export const DEFAULT_PRICE_INR = 40;

/** Built-in fonts (Google / self-hosted CSS). Custom file fonts are separate. */
export function builtInFonts() {
  return Object.entries(QR_FONTS).map(([id, meta]) => ({
    id,
    name: id
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    family: meta.family,
    source: "google",
    href: meta.href || "",
    file_url: "",
  }));
}

export function slugifyThemeId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

export function isValidThemeId(id) {
  return /^[a-z0-9][a-z0-9-]{0,62}$/.test(String(id || ""));
}

export function cleanBusinessTypes(list) {
  const out = [];
  for (const raw of Array.isArray(list) ? list : []) {
    const id = String(raw || "").trim();
    if (TYPE_IDS.has(id) && !out.includes(id)) out.push(id);
  }
  return out;
}

function mergeDeep(base, override) {
  if (!override || typeof override !== "object") return { ...base };
  const out = { ...base };
  for (const key of Object.keys(override)) {
    const val = override[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      out[key] = mergeDeep(base[key] || {}, val);
    } else if (val !== undefined) {
      out[key] = val;
    }
  }
  return out;
}

/** Fresh style recipe for a new theme (logo off — most posters are full art). */
export function defaultThemeStyle() {
  return mergeDeep(QR_STYLE_DEFAULTS, {
    logo: { show: false },
    chrome: "dark",
    font: "dm-sans",
    businessName: {
      top: "18%",
      topWithAmount: "14%",
      fontSize: "1.6rem",
      fontWeight: 700,
      color: "#ffffff",
    },
    amount: {
      show: true,
      top: "28%",
      topWithAmount: "28%",
      color: "#ffffff",
    },
    qr: {
      top: "38%",
      topWithAmount: "42%",
      width: "48%",
    },
    upi: {
      top: "68%",
      topWithAmount: "72%",
      color: "#ffffff",
      variant: "plain",
    },
    copied: {
      top: "72%",
      topWithAmount: "76%",
      color: "#ffffff",
    },
  });
}

function fontEntry(fontKey, customFonts = []) {
  const key = String(fontKey || "dm-sans");
  if (QR_FONTS[key]) return { ...QR_FONTS[key], id: key, source: "google" };
  const custom = customFonts.find((f) => f.id === key);
  if (custom?.file_url) {
    return {
      id: key,
      family: custom.family || `"${custom.name}", sans-serif`,
      href: "",
      fileUrl: custom.file_url,
      source: "file",
    };
  }
  return { ...QR_FONTS["dm-sans"], id: "dm-sans", source: "google" };
}

/**
 * Resolved style for rendering (admin preview or future app fetch).
 * `style` is the theme's jsonb override; `customFonts` from `qr_theme_fonts`.
 */
export function resolveCatalogStyle(style, customFonts = []) {
  const overrides = style && typeof style === "object" ? style : {};
  const { font: fontKey, ...rest } = overrides;
  const merged = mergeDeep(QR_STYLE_DEFAULTS, rest);
  merged.font = fontKey || QR_STYLE_DEFAULTS.font;

  const main = fontEntry(merged.font, customFonts);
  const nameFont = fontEntry(merged.businessName?.font || merged.font, customFonts);
  const amountFont = fontEntry(merged.amount?.font || merged.font, customFonts);
  const upiFont = fontEntry(merged.upi?.font || merged.font, customFonts);
  const line2Font = merged.businessName?.line2Font
    ? fontEntry(merged.businessName.line2Font, customFonts)
    : nameFont;

  merged.fontFamily = main.family;
  merged.fontHref = main.href || "";
  merged.fontFileUrl = main.fileUrl || "";
  merged.businessNameFontFamily = nameFont.family;
  merged.businessNameFontHref = nameFont.href || "";
  merged.businessNameFontFileUrl = nameFont.fileUrl || "";
  merged.amountFontFamily = amountFont.family;
  merged.amountFontHref = amountFont.href || "";
  merged.amountFontFileUrl = amountFont.fileUrl || "";
  merged.upiFontFamily = upiFont.family;
  merged.upiFontHref = upiFont.href || "";
  merged.upiFontFileUrl = upiFont.fileUrl || "";
  merged.line2FontFamily = line2Font.family;
  merged.line2FontHref = line2Font.href || "";
  merged.line2FontFileUrl = line2Font.fileUrl || "";
  return merged;
}

export function catalogFontHrefs(cfg) {
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

export function catalogFontFaces(cfg) {
  const faces = [];
  const seen = new Set();
  for (const [family, url] of [
    [cfg.fontFamily, cfg.fontFileUrl],
    [cfg.businessNameFontFamily, cfg.businessNameFontFileUrl],
    [cfg.amountFontFamily, cfg.amountFontFileUrl],
    [cfg.upiFontFamily, cfg.upiFontFileUrl],
    [cfg.line2FontFamily, cfg.line2FontFileUrl],
  ]) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    faces.push({ family, url });
  }
  return faces;
}

/** Patch one layer's vertical position for the active amount mode. */
export function setLayerTop(style, layer, topPercent, hasAmount) {
  const next = mergeDeep(defaultThemeStyle(), style || {});
  const block = { ...(next[layer] || {}) };
  const value = `${Math.round(Number(topPercent) * 100) / 100}%`;
  if (hasAmount) {
    block.topWithAmount = value;
    if (block.top == null) block.top = value;
  } else {
    block.top = value;
  }
  next[layer] = block;
  return next;
}

export function setQrWidth(style, widthPercent) {
  const next = mergeDeep(defaultThemeStyle(), style || {});
  const w = Math.min(72, Math.max(28, Number(widthPercent) || 48));
  next.qr = { ...(next.qr || {}), width: `${Math.round(w * 10) / 10}%` };
  return next;
}

export function rowToTheme(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || "",
    status: row.status,
    free: Boolean(row.free),
    priceInr: Number(row.price_inr) || DEFAULT_PRICE_INR,
    businessTypes: Array.isArray(row.business_types) ? row.business_types : [],
    posterUrl: row.poster_url || "",
    previewUrl: row.preview_url || "",
    style: row.style && typeof row.style === "object" ? row.style : {},
    sortOrder: Number(row.sort_order) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function themeToRow(theme, { partial = false } = {}) {
  const row = {};
  if (!partial || theme.id != null) row.id = theme.id;
  if (!partial || theme.name != null) row.name = String(theme.name || "").trim().slice(0, 80);
  if (!partial || theme.tagline != null) {
    row.tagline = String(theme.tagline || "").trim().slice(0, 120);
  }
  if (!partial || theme.status != null) {
    row.status = theme.status === "published" ? "published" : "draft";
  }
  if (!partial || theme.free != null) row.free = Boolean(theme.free);
  if (!partial || theme.priceInr != null) {
    row.price_inr = Math.min(9999, Math.max(0, Number(theme.priceInr) || 0));
  }
  if (!partial || theme.businessTypes != null) {
    row.business_types = cleanBusinessTypes(theme.businessTypes);
  }
  if (!partial || theme.posterUrl != null) row.poster_url = String(theme.posterUrl || "");
  if (!partial || theme.previewUrl != null) row.preview_url = String(theme.previewUrl || "");
  if (!partial || theme.style != null) row.style = theme.style || {};
  if (!partial || theme.sortOrder != null) {
    row.sort_order = Number(theme.sortOrder) || 0;
  }
  return row;
}

/** @font-face CSS for custom file fonts used in the admin preview. */
export function fontFaceCss(faces = []) {
  return faces
    .map(({ family, url }) => {
      const fam = String(family || "").replace(/["']/g, "");
      const bare = fam.replace(/^"|"$/g, "").split(",")[0].trim();
      return `@font-face{font-family:${JSON.stringify(bare)};src:url(${JSON.stringify(url)});font-display:swap;}`;
    })
    .join("\n");
}
