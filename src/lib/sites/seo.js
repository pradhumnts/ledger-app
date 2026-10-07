/**
 * Search signals for live shop sites: a title with what the shop is and where,
 * and schema.org LocalBusiness data so Google can tie the site to the shop.
 * Pure helpers; keyed by the shop's own pack id (its business type), never the
 * template's showcase pack, so a clinic on the Glow template isn't called a parlour.
 */
import { cleanPlaceId, phoneDigits, socialUrl } from "./links.js";

const KINDS = {
  photographer: { label: "Photographer", type: "ProfessionalService" },
  salon: { label: "Salon", type: "HairSalon" },
  beauty: { label: "Beauty Parlour", type: "BeautySalon" },
  fitness: { label: "Gym", type: "ExerciseGym" },
  jewellery: { label: "Jewellers", type: "JewelryStore" },
  eyeglasses: { label: "Opticals", type: "Optician" },
  mobiles: { label: "Mobile Shop", type: "MobilePhoneStore" },
  restaurant: { label: "Cafe & Restaurant", type: "Restaurant" },
  fashion: { label: "Clothing Store", type: "ClothingStore" },
  architecture: { label: "Architects", type: "ProfessionalService" },
};

const STATES = new Set(
  [
    "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh", "goa",
    "gujarat", "haryana", "himachal pradesh", "jharkhand", "karnataka", "kerala",
    "madhya pradesh", "maharashtra", "manipur", "meghalaya", "mizoram", "nagaland",
    "odisha", "orissa", "punjab", "rajasthan", "sikkim", "tamil nadu", "telangana",
    "tripura", "uttar pradesh", "uttarakhand", "west bengal", "delhi", "new delhi",
    "jammu and kashmir", "ladakh", "puducherry", "chandigarh", "andaman and nicobar islands",
    "dadra and nagar haveli and daman and diu", "lakshadweep", "mp", "up",
  ]
);

/** States that are a single city, so the city is the state ("Rohini, Delhi" → Delhi). */
const CITY_STATES = /^(new delhi|delhi|chandigarh|puducherry)$/i;

/** Address parts that are a street or building, not a city. */
const STREETISH =
  /\b(shop|road|rd|no|floor|near|opp|opposite|plot|street|st|lane|marg|block|sector|building|bldg|complex|market|bazaar?|chowk|main|tower|plaza|mall)\b/i;

/** The shop's city and state from a free-text Indian address. */
export function addressParts(address) {
  const text = String(address || "");
  const postalCode = text.match(/\b(\d{3})\s?(\d{3})\b/)?.slice(1).join("") || "";
  const parts = text
    .split(/[,\n]/)
    .map((part) => part.replace(/\b\d{3}\s?\d{3}\b/g, "").replace(/[\s.-]+$/, "").trim())
    .filter((part) => part && !/^india$/i.test(part));
  let region = "";
  while (parts.length && STATES.has(parts.at(-1).toLowerCase())) {
    const state = parts.pop();
    region = region || state;
  }
  const last = parts.at(-1) || "";
  const city = CITY_STATES.test(region) ? region : /\d/.test(last) || STREETISH.test(last) ? "" : last;
  return { city, region, postalCode };
}

export function siteKind(packId) {
  return KINDS[String(packId || "")] || { label: "", type: "LocalBusiness" };
}

/** "Shadow Beauty – Beauty Parlour in Indore"; the label is skipped when the name already says it. */
export function siteTitle({ name, packId, address }) {
  const shop = String(name || "").trim();
  if (!shop) return "";
  const { label } = siteKind(packId);
  const { city } = addressParts(address);
  const words = label.toLowerCase().split(/[^a-z]+/).filter((word) => word.length > 2);
  const named = words.length > 0 && words.every((word) => shop.toLowerCase().includes(word.replace(/s$/, "")));
  const what = label && !named ? label : "";
  const where = city && !shop.toLowerCase().includes(city.toLowerCase()) ? city : "";
  if (what && where) return `${shop} – ${what} in ${where}`;
  if (what) return `${shop} – ${what}`;
  if (where) return `${shop}, ${where}`;
  return shop;
}

function realImage(value) {
  const url = String(value || "");
  return url.startsWith("https://") ? url : "";
}

/**
 * schema.org data for the shop. `doc` is the resolved document (pack defaults
 * filled in), `packId` the shop's own business type.
 */
export function localBusinessJsonLd({ doc, packId, url, description, instagramUsername = "" }) {
  const business = doc?.business || {};
  const sections = doc?.sections || {};
  const socials = sections.socials || {};
  const name = String(business.name || "").trim();
  if (!name || !url) return null;

  const phone = phoneDigits(business.phone);
  const { city, region, postalCode } = addressParts(business.address);
  const placeId = cleanPlaceId(doc?.google?.placeId);
  const mapsLink = placeId ? `https://www.google.com/maps/place/?q=place_id:${placeId}` : "";
  const sameAs = [
    socialUrl("instagram", socials.instagram) ||
      (instagramUsername ? `https://www.instagram.com/${instagramUsername}/` : ""),
    socialUrl("facebook", socials.facebook),
    socialUrl("youtube", socials.youtube),
    mapsLink,
  ].filter(Boolean);
  const images = [realImage(sections.hero?.image), realImage(sections.about?.image)].filter(Boolean);
  const logo = realImage(business.logo);

  const data = {
    "@context": "https://schema.org",
    "@type": siteKind(packId).type,
    "@id": `${url}/#business`,
    name,
    url,
    ...(description ? { description } : {}),
    ...(phone.length === 10 ? { telephone: `+91${phone}` } : {}),
    ...(images.length || logo ? { image: images.length ? images : [logo] } : {}),
    ...(logo ? { logo } : {}),
    ...(business.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: String(business.address).replace(/\s*\n\s*/g, ", ").slice(0, 200),
            ...(city ? { addressLocality: city } : {}),
            ...(region ? { addressRegion: region } : {}),
            ...(postalCode ? { postalCode } : {}),
            addressCountry: "IN",
          },
        }
      : {}),
    ...(mapsLink ? { hasMap: mapsLink } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
  return data;
}

/** "Bridal Makeup in Indore – Shadow Beauty" for a service page. */
export function servicePageTitle({ title, name, address }) {
  const service = String(title || "").trim();
  const shop = String(name || "").trim();
  const { city } = addressParts(address);
  const where = city && !service.toLowerCase().includes(city.toLowerCase()) ? ` in ${city}` : "";
  return [`${service}${where}`, shop].filter(Boolean).join(" – ");
}

/**
 * schema.org Service for a service page, offered by the shop's LocalBusiness
 * (`siteUrl` is the home page URL its `@id` is built from).
 */
export function serviceJsonLd({ page, url, siteUrl, description, address }) {
  const name = String(page?.title || "").trim();
  if (!name || !url || !siteUrl) return null;
  const images = [page.image, ...(Array.isArray(page.images) ? page.images : [])]
    .map(realImage)
    .filter(Boolean);
  const price = Math.round(Number(page.price));
  const { city } = addressParts(address);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name,
    url,
    ...(description ? { description } : {}),
    provider: { "@id": `${siteUrl}/#business` },
    ...(images.length ? { image: [...new Set(images)].slice(0, 6) } : {}),
    ...(city ? { areaServed: city } : {}),
    ...(price > 0
      ? {
          offers: {
            "@type": "Offer",
            price: String(price),
            priceCurrency: "INR",
            url,
          },
        }
      : {}),
  };
}

/** JSON for a <script type="application/ld+json">, safe to inline in HTML. */
export function jsonLdScript(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function sitemapXml(entries) {
  const escape = (value) =>
    String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const urls = entries
    .map(({ loc, lastmod }) => {
      const date = lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : "";
      return `<url><loc>${escape(loc)}</loc>${date}</url>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}
