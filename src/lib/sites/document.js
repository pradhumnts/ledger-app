import {
  SITE_SECTIONS,
  getPalette,
  getPublishableTemplate,
  getTemplate,
} from "@/lib/sites/catalog";
import { cleanPlaceId, cleanSocial, phoneDigits } from "@/lib/sites/links";
import { cleanOffers } from "@/lib/sites/offers";
import { getPack } from "@/lib/sites/packs";
import { SERVICE_PAGE_IDS, isServicePageId } from "@/lib/sites/service-pages";

/**
 * v2 stores only what the shop changed: empty fields (and a missing gallery)
 * are filled from the content pack when the site is rendered.
 */
export const SITE_DOCUMENT_VERSION = 2;

const PACK_IMAGE = /^\/site-packs\/[a-z0-9-]+\/[a-z0-9-]+\.(webp|jpe?g|png)$/;
const MAX_PRICE = 10_000_000;

function clip(value, max) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

function mediaPrefix(userId) {
  const base = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  if (!base || !userId) return "";
  return `${base}/storage/v1/object/public/site-media/${userId}/`;
}

function isPackImage(value) {
  return PACK_IMAGE.test(String(value || ""));
}

function cleanImage(value, prefix) {
  const url = String(value || "").trim();
  if (isPackImage(url)) return url;
  if (prefix && url.startsWith(prefix) && !url.includes("..") && url.length < 400) {
    return url;
  }
  return "";
}

function cleanPrice(value) {
  const amount = Math.round(Number(value));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return Math.min(amount, MAX_PRICE);
}

function cleanField(field, value, prefix) {
  switch (field.type) {
    case "text":
    case "textarea":
      return clip(value, field.max || 200);
    case "phone":
      return phoneDigits(value);
    case "price":
      return cleanPrice(value);
    case "image":
      return cleanImage(value, prefix);
    case "images":
      // null = the shop never touched the gallery; [] = they removed every photo.
      if (!Array.isArray(value)) return null;
      return value
        .map((item) => cleanImage(item, prefix))
        .filter(Boolean)
        .slice(0, field.max || 12);
    case "list":
      return (Array.isArray(value) ? value : [])
        .slice(0, field.max || 8)
        .map((item) => cleanFields(field.itemFields, item, prefix))
        .filter((item) => Object.values(item).some((v) => v !== "" && v !== null));
    default:
      return "";
  }
}

function cleanFields(fields, input, prefix) {
  const source = input && typeof input === "object" ? input : {};
  const out = {};
  for (const field of fields) {
    out[field.key] = cleanField(field, source[field.key], prefix);
  }
  return out;
}

function emptyValue(field) {
  if (field.type === "images") return null;
  if (field.type === "list") return [];
  if (field.type === "price") return null;
  return "";
}

function isBlank(field, value) {
  if (field.type === "images") return !Array.isArray(value);
  if (field.type === "list") return !Array.isArray(value) || value.length === 0;
  return value === undefined || value === null || value === "";
}

/**
 * Pack that fills a site's untouched fields and template copy: the shop's own
 * business-type pack, or the template's showcase pack when the type has none.
 */
export function contentPack(templateId, packId) {
  const pack = getPack(packId);
  if (pack.id !== "general") return pack;
  const starter = getTemplate(templateId).starterPack;
  return starter ? getPack(starter) : pack;
}

/** Default value of every field for a template + shop pack (what an untouched site shows). */
export function siteDefaults(templateId, packId) {
  const template = getTemplate(templateId);
  const pack = contentPack(template.id, packId);
  const sections = {};
  for (const id of template.sections) {
    const base = pack.sections[id] || {};
    const out = {};
    for (const field of SITE_SECTIONS[id].fields) {
      const value = base[field.key];
      out[field.key] =
        value === undefined
          ? field.type === "images"
            ? []
            : emptyValue(field)
          : structuredClone(value);
    }
    sections[id] = out;
  }
  return {
    packId: pack.id,
    hours: pack.hours || "",
    whatsappMessage: pack.whatsappMessage || "",
    sections,
  };
}

/** The document as visitors see it: untouched fields filled from the content pack. */
export function withSiteDefaults(doc) {
  if (!doc || typeof doc !== "object") return doc;
  const template = getTemplate(doc.templateId);
  const defaults = siteDefaults(template.id, doc.packId);
  const legacy = Number(doc.v || 1) < 2;
  const sections = {};
  for (const id of template.sections) {
    const own = doc.sections?.[id] || {};
    const base = defaults.sections[id];
    const out = { ...own };
    for (const field of SITE_SECTIONS[id].fields) {
      const value = own[field.key];
      if (field.fixed || isBlank(field, value) || isUntouched(field, value, [], legacy)) {
        out[field.key] = base[field.key];
      }
    }
    sections[id] = out;
  }
  // Service pages have no sample content: they show only what the shop wrote.
  for (const id of SERVICE_PAGE_IDS) {
    if (doc.sections?.[id]) sections[id] = doc.sections[id];
  }
  return {
    ...doc,
    packId: defaults.packId,
    whatsappMessage: doc.whatsappMessage || defaults.whatsappMessage,
    business: { ...doc.business, hours: doc.business?.hours || defaults.hours },
    sections,
  };
}

function sameValue(field, value, candidate) {
  if (candidate === undefined) return false;
  if (field.type === "list") {
    return JSON.stringify(value) === JSON.stringify(cleanField(field, candidate, ""));
  }
  return value === cleanField(field, candidate, "");
}

/**
 * Whether a cleaned value is still sample content. Sample images always are;
 * text and lists are when they match a pack default word for word.
 */
function isUntouched(field, value, candidates, legacy) {
  if (field.type === "image") return isPackImage(value);
  if (field.type === "images") {
    // v1 copied the sample gallery into every draft; only real uploads count there.
    return legacy && Array.isArray(value) && value.every(isPackImage);
  }
  if (field.type === "text" || field.type === "textarea" || field.type === "list") {
    return candidates.some((candidate) => sameValue(field, value, candidate));
  }
  return false;
}

/**
 * The shop's own Google listing (Standard plan): `reviews` shows its Google
 * reviews on the site, `reviewLink` adds "rate us" to WhatsApp messages.
 */
function cleanGoogle(input) {
  const placeId = cleanPlaceId(input?.placeId);
  if (!placeId) return null;
  return {
    placeId,
    name: clip(input.name, 120),
    address: clip(input.address, 200),
    reviews: input.reviews !== false,
    reviewLink: input.reviewLink !== false,
  };
}

/** Validate a document from the app. Unknown keys are dropped. */
export function sanitizeSiteDocument(input, { userId } = {}) {
  const source = input && typeof input === "object" ? input : {};
  const legacy = Number(source.v || 1) < 2;
  const template = getPublishableTemplate(source.templateId);
  const palette = getPalette(template, source.paletteId);
  const pack = getPack(source.packId);
  const packs = [pack, contentPack(template.id, pack.id)];
  const prefix = mediaPrefix(userId);

  const business = cleanFields(SITE_SECTIONS.business.fields, source.business, prefix);
  if (packs.some((item) => business.hours === item.hours)) business.hours = "";

  const sectionsIn = source.sections && typeof source.sections === "object" ? source.sections : {};
  const sections = {};
  for (const id of template.sections) {
    const fields = SITE_SECTIONS[id].fields;
    const cleaned = cleanFields(fields, sectionsIn[id], prefix);
    for (const field of fields) {
      const candidates = packs.map((item) => item.sections[id]?.[field.key]);
      if (field.fixed || isUntouched(field, cleaned[field.key], candidates, legacy)) {
        cleaned[field.key] = emptyValue(field);
      }
    }
    sections[id] = cleaned;
  }
  if (sections.socials) {
    for (const kind of Object.keys(sections.socials)) {
      sections.socials[kind] = cleanSocial(kind, sections.socials[kind]);
    }
  }
  // Kept on any plan (the live site shows them only on Standard), so a lapsed
  // Standard shop gets its pages back when it renews.
  for (const id of SERVICE_PAGE_IDS) {
    if (!sectionsIn[id] || typeof sectionsIn[id] !== "object") continue;
    const page = cleanFields(SITE_SECTIONS[id].fields, sectionsIn[id], prefix);
    const filled = Object.values(page).some((value) =>
      Array.isArray(value) ? value.length > 0 : value !== "" && value !== null
    );
    if (filled) sections[id] = page;
  }

  const hidden = (Array.isArray(source.hidden) ? source.hidden : []).filter(
    (id) => template.optionalSections.includes(id) || isServicePageId(id)
  );
  const message = clip(source.whatsappMessage, 200);
  const offers = cleanOffers(source.offers);

  return {
    v: SITE_DOCUMENT_VERSION,
    templateId: template.id,
    templateVersion: template.version,
    paletteId: palette.id,
    packId: pack.id,
    whatsappMessage: packs.some((item) => message === item.whatsappMessage) ? "" : message,
    business,
    sections,
    hidden: [...new Set(hidden)],
    google: cleanGoogle(source.google),
    // Kept on any plan like service pages; live sites show them only on Standard.
    // Left out when empty so drafts of shops without offers still match what's published.
    ...(offers.length ? { offers } : {}),
  };
}

/**
 * Shop name, phone, address and logo always mirror the business profile.
 * Pass `logoUrl` only when it was refreshed; otherwise the current one stays.
 */
export function applyBusinessProfile(doc, business = {}, { logoUrl } = {}) {
  const phone = phoneDigits(business.phone);
  return {
    ...doc,
    business: {
      ...doc.business,
      name: clip(business.name, 60) || "My Business",
      phone,
      whatsapp: doc.business?.whatsapp || phone,
      address: clip(business.address, 200),
      ...(logoUrl !== undefined ? { logo: logoUrl } : {}),
    },
  };
}

/** First draft for a shop: nothing changed yet, so every field shows the pack default. */
export function buildStarterSite({ business = {}, logoUrl = "", templateId, paletteId } = {}) {
  const template = getTemplate(templateId);
  const pack = getPack(business.business_type);
  const sections = Object.fromEntries(
    template.sections.map((id) => [
      id,
      Object.fromEntries(
        SITE_SECTIONS[id].fields.map((field) => [field.key, emptyValue(field)])
      ),
    ])
  );
  const doc = {
    v: SITE_DOCUMENT_VERSION,
    templateId: template.id,
    templateVersion: template.version,
    paletteId: getPalette(template, paletteId).id,
    packId: pack.id,
    whatsappMessage: "",
    business: { whatsapp: "", hours: "" },
    sections,
    hidden: [],
  };
  return applyBusinessProfile(doc, business, { logoUrl });
}

export function siteDescription(doc) {
  const resolved = withSiteDefaults(doc);
  const pack = getPack(resolved?.packId);
  const name = resolved?.business?.name || "Our business";
  return clip(resolved?.sections?.hero?.subtitle, 160) || pack.description(name);
}
