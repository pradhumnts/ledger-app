import { APP_SITE_URL, PLAY_STORE_URL } from "./branding.js";

/**
 * Short install links (`moneykitapp.com/get/bill`) used by the app's shares and
 * every "get MoneyKit" link on the website. Each tag keeps the utm pair it used
 * before, so Play Console acquisition reports stay continuous. Play only reports
 * utm_source and utm_campaign.
 */
const TAGS = {
  wa: { source: "whatsapp", campaign: "share" },
  bill: { source: "whatsapp", campaign: "bill" },
  receipt: { source: "whatsapp", campaign: "receipt" },
  statement: { source: "whatsapp", campaign: "statement" },
  invite: { source: "app_share", campaign: "invite" },
  pdf: { source: "bill_pdf", campaign: "footer" },
  "bill-logo": { source: "bill_page", campaign: "logo" },
  "bill-badge": { source: "bill_page", campaign: "badge" },
  "pay-logo": { source: "pay_page", campaign: "logo" },
  site: { source: "shop_site", campaign: "footer" },
  "site-404": { source: "shop_site", campaign: "not_found" },
  "web-logo": { source: "website", campaign: "logo" },
  "web-cta": { source: "website", campaign: "cta" },
};

const TAG = /^[a-z0-9_-]{1,32}$/;
const APPLE_DEVICE = /iPhone|iPad|iPod/i;

/** A known or new tag in canonical form, or "" for a bare `/get` (or junk). */
export function cleanAppLinkTag(raw) {
  const tag = String(raw || "").trim().toLowerCase();
  return TAG.test(tag) ? tag : "";
}

/** The smart install link for a tag; it picks the right store when opened. */
export function appLink(tag) {
  const clean = cleanAppLinkTag(tag);
  return clean ? `${APP_SITE_URL}/get/${clean}` : `${APP_SITE_URL}/get`;
}

/** New tags (posters, Instagram…) work without a code change: the tag becomes the utm_source. */
export function appLinkPlayUrl(tag) {
  const { source, campaign } = TAGS[tag] || {
    source: tag || "link",
    campaign: tag ? "link" : "direct",
  };
  const referrer = `utm_source=${source}&utm_campaign=${campaign}`;
  return `${PLAY_STORE_URL}&referrer=${encodeURIComponent(referrer)}`;
}

/**
 * The App Store listing for iPhone and iPad visitors, or "" while there is none
 * (`APP_STORE_URL` unset): they get the Play listing like everyone else.
 * The tag rides along as App Store Connect's campaign (`ct`).
 */
export function appStoreUrlFor(userAgent, tag, appStoreUrl = process.env.APP_STORE_URL) {
  const base = String(appStoreUrl || "").trim();
  if (!base || !APPLE_DEVICE.test(String(userAgent || ""))) return "";
  try {
    const url = new URL(base);
    if (tag && !url.searchParams.has("ct")) url.searchParams.set("ct", tag);
    return url.toString();
  } catch {
    return "";
  }
}
