import { APP_SITE_URL } from "@/lib/branding";

/** Link-preview card served at `/sites/{slug}/share-image`. */
export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 };

export const SLUG_MIN = 3;
export const SLUG_MAX = 30;

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export const RESERVED_SLUGS = new Set([
  "about",
  "account",
  "admin",
  "api",
  "app",
  "assets",
  "auth",
  "b",
  "billing",
  "blog",
  "cdn",
  "dashboard",
  "dev",
  "docs",
  "email",
  "ftp",
  "help",
  "home",
  "img",
  "login",
  "mail",
  "moneykit",
  "news",
  "official",
  "p",
  "pay",
  "payments",
  "preview",
  "privacy",
  "root",
  "shop",
  "signup",
  "site",
  "sites",
  "smtp",
  "static",
  "staging",
  "status",
  "store",
  "support",
  "terms",
  "test",
  "www",
]);

/** Root domain for shop sites, e.g. "moneykit.site" or "localhost:3000". Empty = path mode. */
export function sitesDomain() {
  return String(process.env.SITES_DOMAIN || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
}

function isLocalDomain(domain) {
  return domain === "localhost" || domain.startsWith("localhost:");
}

export function siteUrl(slug) {
  const domain = sitesDomain();
  if (!domain) return `${APP_SITE_URL}/sites/${slug}`;
  return `${isLocalDomain(domain) ? "http" : "https"}://${slug}.${domain}`;
}

/** Site slug for a request host, or "" when the host is not a shop site. */
export function slugFromHost(host) {
  const domain = sitesDomain();
  const value = String(host || "").trim().toLowerCase();
  if (!domain || !value.endsWith(`.${domain}`)) return "";
  const label = value.slice(0, -(domain.length + 1));
  if (!label || label.includes(".")) return "";
  return label;
}

/** Bare sites domain (no shop). Local dev shares it with the main app, so never. */
export function isRootSitesHost(host) {
  const domain = sitesDomain();
  if (!domain || isLocalDomain(domain)) return false;
  const value = String(host || "").trim().toLowerCase();
  return value === domain || value === `www.${domain}`;
}

export function isFreePublish() {
  return String(process.env.SITES_FREE_PUBLISH || "").trim().toLowerCase() === "true";
}

export function normalizeSlug(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, "");
}

/** "" when the slug is usable, otherwise a short reason code. */
export function slugProblem(slug) {
  const value = String(slug || "");
  if (value.length < SLUG_MIN) return "short";
  if (value.length > SLUG_MAX) return "long";
  if (!SLUG_PATTERN.test(value) || value.includes("--")) return "invalid";
  if (RESERVED_SLUGS.has(value)) return "reserved";
  return "";
}

export function suggestSlugs(businessName, suffixes = []) {
  const base = normalizeSlug(businessName);
  const out = [];
  const add = (value) => {
    const slug = normalizeSlug(value);
    if (slug && !slugProblem(slug) && !out.includes(slug)) out.push(slug);
  };
  if (base) {
    add(base);
    for (const suffix of suffixes) add(`${base}-${suffix}`);
  }
  for (const suffix of suffixes) add(`my-${suffix}`);
  return out;
}
