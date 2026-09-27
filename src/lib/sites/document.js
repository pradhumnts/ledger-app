import {
  SITE_SECTIONS,
  getPalette,
  getTemplate,
} from "@/lib/sites/catalog";
import { instagramHandle, phoneDigits } from "@/lib/sites/links";
import { getPack } from "@/lib/sites/packs";

export const SITE_DOCUMENT_VERSION = 1;

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

function cleanImage(value, prefix) {
  const url = String(value || "").trim();
  if (PACK_IMAGE.test(url)) return url;
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
      return (Array.isArray(value) ? value : [])
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

/** Validate a document from the app. Unknown keys are dropped. */
export function sanitizeSiteDocument(input, { userId } = {}) {
  const source = input && typeof input === "object" ? input : {};
  const template = getTemplate(source.templateId);
  const palette = getPalette(template, source.paletteId);
  const pack = getPack(source.packId);
  const prefix = mediaPrefix(userId);

  const business = cleanFields(SITE_SECTIONS.business.fields, source.business, prefix);
  business.instagram = instagramHandle(business.instagram);

  const sectionsIn = source.sections && typeof source.sections === "object" ? source.sections : {};
  const sections = {};
  for (const id of template.sections) {
    sections[id] = cleanFields(SITE_SECTIONS[id].fields, sectionsIn[id], prefix);
  }

  const hidden = (Array.isArray(source.hidden) ? source.hidden : []).filter((id) =>
    template.optionalSections.includes(id)
  );

  return {
    v: SITE_DOCUMENT_VERSION,
    templateId: template.id,
    templateVersion: template.version,
    paletteId: palette.id,
    packId: pack.id,
    whatsappMessage: clip(source.whatsappMessage || pack.whatsappMessage, 200),
    business,
    sections,
    hidden: [...new Set(hidden)],
  };
}

/** First draft for a shop: content pack + what MoneyKit already knows. */
export function buildStarterSite({ business = {}, logoUrl = "", templateId, paletteId } = {}) {
  const template = getTemplate(templateId);
  const pack = getPack(business.business_type);
  const phone = phoneDigits(business.phone);
  return {
    v: SITE_DOCUMENT_VERSION,
    templateId: template.id,
    templateVersion: template.version,
    paletteId: getPalette(template, paletteId).id,
    packId: pack.id,
    whatsappMessage: pack.whatsappMessage,
    business: {
      name: clip(business.name, 60) || "My Business",
      phone,
      whatsapp: phone,
      address: clip(business.address, 200),
      hours: pack.hours,
      instagram: "",
      logo: logoUrl,
    },
    sections: structuredClone(
      Object.fromEntries(template.sections.map((id) => [id, pack.sections[id] || {}]))
    ),
    hidden: [],
  };
}

export function siteDescription(doc) {
  const pack = getPack(doc?.packId);
  const name = doc?.business?.name || "Our business";
  return clip(doc?.sections?.hero?.subtitle, 160) || pack.description(name);
}
